import Dexie from "dexie";
import { ref, computed } from "vue";

export interface Message {
  role: string;
  content: string;
}

export interface ChatSession {
  id?: number;
  createdAt: number;
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
      messages: [],
    };
    const id = await db.chats.add(newSession);
    await loadSessions();
    return id;
  }

  // expose reactive state and actions
  return {
    sessions: computed(() => sessions.value),
    loadSessions,
    addMessage,
    createSession,
  };
}
