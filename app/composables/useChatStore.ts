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

// Singleton store instance - shared across the entire app
const sessions = ref<ChatSession[]>([]);
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

async function updateMessageContent(sessionId: number, messageIndex: number, newContent: string) {
  const session = await db.chats.get(sessionId);
  if (!session || !Array.isArray(session.messages)) return;
  
  (session.messages as any)[messageIndex].content = newContent;
  await db.chats.update(sessionId, { messages: session.messages });
  await loadSessions();
}

async function updateLastMessage(sessionId: number, newContent: string) {
  const session = await db.chats.get(sessionId);
  if (!session || !Array.isArray(session.messages) || session.messages.length === 0) return;
  
  (session.messages as any)[(session.messages as any).length - 1].content = newContent;
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
  sessions.value.push({ ...newSession, id });
  return id;
}

function generateDefaultTitle(): string {
  if (sessions.value.length === 0) {
    return `Session at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  const fallbackTime = new Date(sessions.value[0]?.createdAt ?? Date.now());
  return `Session at ${fallbackTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

async function updateTitle(sessionId: number, newTitle: string) {
  const session = await db.chats.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found`);

  await db.chats.update(sessionId, { title: newTitle });
  sessions.value = sessions.value.map((s) =>
    s.id === sessionId ? { ...s, title: newTitle } : s,
  );
}

async function deleteSession(sessionId: number) {
  const session = await db.chats.get(sessionId);
  if (!session) throw new Error(`Session ${sessionId} not found`);

  await db.chats.delete(sessionId);
  sessions.value = sessions.value.filter((s) => s.id !== sessionId);
  await loadSessions();
}

async function duplicateSession(sessionId: number) {
  const original = await db.chats.get(sessionId);
  if (!original) throw new Error(`Session ${sessionId} not found`);

  const newSession: ChatSession = {
    id: undefined,
    createdAt: Date.now(),
    title: original.title + " (Copy)",
    messages: JSON.parse(JSON.stringify(original.messages)),
  };
  const id = await db.chats.add(newSession);
  sessions.value.push({ ...newSession, id });
  return id;
}

// Export singleton store with reactive state and actions
export function useChatStore() {
  return {
    sessions: computed(() => sessions.value),
    isStreaming,
    selectedModel,
    loadSessions,
    addMessage,
    updateLastMessage,
    createSession,
    updateTitle,
    deleteSession,
    duplicateSession,
  } as const;
}

// Also export the singleton directly for use in components that need direct access
export const chatStore = {
  sessions: computed(() => sessions.value),
  isStreaming,
  selectedModel,
  loadSessions,
  addMessage,
  updateLastMessage,
  createSession,
  updateTitle,
  deleteSession,
  duplicateSession,
};
