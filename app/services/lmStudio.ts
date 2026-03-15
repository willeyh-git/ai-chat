import axios from "axios";
import { ref } from "vue";
import type { ChatCompletionChunk, Message } from '@/types/lmStudio';

const API_URL = process.env.LM_STUDIO_API_URL || "http://192.168.68.128:1234/v1/chat/completions";
const API_KEY = process.env.LM_STUDIO_API_KEY || "";

export const availableModels = ref<string[]>([]);
export const selectedModel = ref<string>("openai/gpt-oss-20b");

/**
 * Fetch available models from LM Studio
 */
export async function fetchModels() {
  try {
    const res = await axios.get("http://192.168.68.128:1234/v1/models");
    // response structure: { object: "list", data: [{ id, object, created, owned_by }, ...] }
    const models = res.data?.data || [];
    const ids = models.map((model: { id: string }) => model.id);
    availableModels.value = ids;
    console.log("Fetched models:", ids);
    if (!ids.includes(selectedModel.value)) {
      selectedModel.value = ids[0] ?? "";
    }
  } catch (e) {
    console.error("Failed to fetch models", e);
  }
}

/**
 * Parse a raw chunk string into ChatCompletionChunk or null
 */
export function parseChunk(raw: string): ChatCompletionChunk | null {
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw) as ChatCompletionChunk;
  } catch (e) {
    console.error("Failed to parse chunk:", e);
    return null;
  }
}

/**
 * Get chat completion response (non-streaming)
 */
export async function getChatCompletion(messages: Message[]): Promise<ChatCompletionChunk> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ model: selectedModel.value, messages }),
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data as ChatCompletionChunk;
}

/**
 * Get chat completion stream (streaming with `stream: true`)
 */
export async function* getChatCompletionStream(messages: Message[]): AsyncGenerator<ChatCompletionChunk, void, unknown> {
  const controller = new AbortController();
  const signal = controller.signal;
  
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ 
      model: selectedModel.value, 
      messages,
      stream: true // Required for streaming per LM Studio spec
    }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.statusText}`);
  }

  const reader = res.body!.getReader();
  let buffer = "";
  
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    buffer += new TextDecoder().decode(value);
    
    // LM Studio sends JSON lines separated by \n
    let lineEnd;
    while ((lineEnd = buffer.indexOf("\n")) !== -1) {
      const raw = buffer.slice(0, lineEnd).trim();
      buffer = buffer.slice(lineEnd + 1);
      
      if (!raw) continue;
      
      const chunk = parseChunk(raw);
      if (chunk) {
        yield chunk;
      }
    }
  }
  
  // Drain remaining buffer
  if (buffer.trim()) {
    const chunk = parseChunk(buffer);
    if (chunk) {
      yield chunk;
    }
  }
  
  controller.abort();
}
