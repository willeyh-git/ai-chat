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
export function parseChunk(raw: string | null): ChatCompletionChunk | null {
  if (!raw || !raw.trim()) return null;
  
  // Strip SSE-style prefixes like "data: " before parsing JSON
  const jsonStr = raw.replace(/^data:\s*/, '');
  
  // Skip non-JSON lines like "DONE", "[DONE]", etc.
  if (jsonStr === 'DONE' || jsonStr === '[DONE]' || !/^\{/.test(jsonStr)) {
    console.debug('Skipping non-JSON chunk:', jsonStr);
    return null;
  }
  
  try {
    return JSON.parse(jsonStr) as ChatCompletionChunk;
  } catch (e) {
    console.error("Failed to parse chunk:", e, "Raw value:", raw);
    return null;
  }
}

/**
 * Get chat completion response (non-streaming) with retry logic
 */
export async function getChatCompletion(messages: Message[]): Promise<ChatCompletionChunk> {
  const maxRetries = 3;
  const baseDelayMs = 1000; // 1 second
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
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
    } catch (error) {
      // Last attempt or network error - don't retry on 4xx/5xx client errors
      if (attempt === maxRetries || (error as Error).message.includes("Failed to fetch")) {
        throw error;
      }
      
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${baseDelayMs * Math.pow(2, attempt)}ms...`);
      await new Promise(resolve => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt)));
    }
  }
  
  // Should never reach here, but TypeScript needs a return
  throw new Error("Failed to get chat completion after multiple retries");
}

/**
 * Get chat completion stream (streaming with `stream: true`) with retry logic
 */
export async function* getChatCompletionStream(messages: Message[]): AsyncGenerator<ChatCompletionChunk, void, unknown> {
  const maxRetries = 3;
  const baseDelayMs = 1000; // 1 second
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      yield* await streamWithTimeout(messages);
      return; // Success, exit retry loop
    } catch (error) {
      // Last attempt or network error - don't retry on client errors
      if (attempt === maxRetries || (error as Error).message.includes("Failed to fetch")) {
        throw error;
      }
      
      console.warn(`Stream attempt ${attempt + 1} failed, retrying in ${baseDelayMs * Math.pow(2, attempt)}ms...`);
      await new Promise(resolve => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt)));
    }
  }
  
  // Should never reach here
  throw new Error("Failed to stream chat completion after multiple retries");
}

/**
 * Internal streaming function with timeout (used by retry logic)
 */
async function* streamWithTimeout(messages: Message[]): AsyncGenerator<ChatCompletionChunk, void, unknown> {
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | undefined;
  const STREAM_TIMEOUT_MS = 60_000; // 60 seconds timeout for streaming
  
  try {
    // Set timeout to abort after 60 seconds of inactivity
    timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);
    
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
        
        // Strip SSE-style prefixes like "data: " before parsing JSON
        const jsonStr = raw.replace(/^data:\s*/, '');
        
        const chunk = parseChunk(jsonStr);
        if (chunk) {
          yield chunk;
        }
      }
    }
    
    // Drain remaining buffer
    if (buffer.trim()) {
      const jsonStr = buffer.replace(/^data:\s*/, '');
      const chunk = parseChunk(jsonStr);
      if (chunk) {
        yield chunk;
      }
    }
  } finally {
    clearTimeout(timeoutId);
    controller.abort();
  }
}
