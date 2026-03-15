import axios from "axios";
import { ref } from "vue";
import type { ChatCompletionChunk, Message } from '@/types/lmStudio';

const API_URL = process.env.LM_STUDIO_API_URL || "http://192.168.68.128:1234/v1/chat/completions";
const API_KEY = process.env.LM_STUDIO_API_KEY || "";

export const availableModels = ref<string[]>([]);
export const selectedModel = ref<string>("openai/gpt-oss-20b");

export async function fetchModels() {
  try {
    const res = await axios.get("http://192.168.68.128:1234/v1/models");
    // response structure: { object: "list", data: [{ id, object, created, owned_by }, ...] }
    const models = res.data?.data || [];
    const ids = models.map((m: any) => m.id);
    availableModels.value = ids;
    console.log("Fetched models:", ids);
    if (!ids.includes(selectedModel.value)) {
      selectedModel.value = ids[0] ?? "";
    }
  } catch (e) {
    console.error("Failed to fetch models", e);
  }
}

export async function* getChatCompletionStream(messages: { role: string; content: string }[]): AsyncGenerator<ChatCompletionChunk, any, any> {
  const controller = new AbortController();
  const signal = controller.signal;
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ model: selectedModel.value, messages }),
    signal,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.statusText}`);

  const reader = res.body!.getReader();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += new TextDecoder().decode(value, { stream: true });
    // LM Studio sends JSON lines separated by \n
    let lineEnd;
    while ((lineEnd = buffer.indexOf("\n")) !== -1) {
      const raw = buffer.slice(0, lineEnd).trim();
      buffer = buffer.slice(lineEnd + 1);
      if (!raw) continue;
      try {
        const chunk: ChatCompletionChunk = JSON.parse(raw) as ChatCompletionChunk // eslint-disable-line @typescript-eslint/no-explicit-any
        yield chunk;
      } catch (_) {}
    }
  }
  // Drain remaining buffer
  if (buffer.trim()) {
    try { yield JSON.parse(buffer) as ChatCompletionChunk; } catch (_) {}
  }
  controller.abort();
}
