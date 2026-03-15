import Dexie from "dexie";
import { ref, computed } from "vue";
import type { Message } from '@/types/lmStudio';
import { selectedModel } from "@/services/lmStudio";

export interface ChatSession {
  id?: number;
  createdAt: number;
  title: string; // Auto-generated from first message or timestamp
  messages: Message[];
}

class ChatDB extends Dexie {
  chats!: Dexie.Table<ChatSession, number>;

  constructor() {
    super("chat-db");
    this.version(1).stores({
      chats: "++id,createdAt",
    });
  }
}

const db = new ChatDB();

export function useChatStore() {
  const sessions = ref<ChatSession[]>([]);
  // Track streaming state per session/message
  const isStreaming = ref<boolean>(false);

  async function loadSessions() {
    sessions.value = await db.chats.toArray();
  }

  async function addMessage(sessionId: number, message: Message) {
    const session = await db.chats.get(sessionId);
    if (!session) return;
    session.messages.push(message);
    await db.chats.update(sessionId, { messages: session.messages });
    await loadSessions();
  }

  async function createSession() {
    const newSession: ChatSession = {
      createdAt: Date.now(),
      title: generateDefaultTitle(),
      messages: [],
    };
    const id = await db.chats.add(newSession);
    await loadSessions();
    return id;
  }

  function generateDefaultTitle(): string {
    // Fallback to timestamp if no sessions exist yet
    const fallbackTime = new Date(sessions.value[0]?.createdAt ?? Date.now());
    return `Session at ${fallbackTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  async function updateTitle(sessionId: number, newTitle: string) {
    const session = await db.chats.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    // Update in database
    await db.chats.update(sessionId, { title: newTitle });
    // Update reactive state - cast to allow map/filter on Ref value
    sessions.value = (sessions.value as ChatSession[]).map((s) =>
      s.id === sessionId ? { ...s, title: newTitle } : s,
    );
  }

  async function deleteSession(sessionId: number) {
    const session = await db.chats.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    // Remove from database
    await db.chats.delete(sessionId);
    // Update reactive state - cast to allow filter on Ref value
    sessions.value = (sessions.value as ChatSession[]).filter(
      (s) => s.id !== sessionId,
    );
  }

  async function duplicateSession(sessionId: number) {
    const original = await db.chats.get(sessionId);
    if (!original) throw new Error(`Session ${sessionId} not found`);

    // Create copy with new ID and same content
    const newSession: ChatSession = {
      id: undefined, // Let DB auto-generate
      createdAt: Date.now(),
      title: original.title + " (Copy)",
      messages: JSON.parse(JSON.stringify(original.messages)),
    };
    const id = await db.chats.add(newSession);
    await loadSessions();
    return id;
  }

  // expose reactive state and actions
  return {
    sessions: computed(() => sessions.value),
    isStreaming,
    selectedModel,
    loadSessions,
    addMessage,
    createSession,
    updateTitle,
    deleteSession,
    duplicateSession,
  };
}
