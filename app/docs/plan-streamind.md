# Plan – Stream Support for LM Studio

This document outlines the design and implementation steps required to add **streaming** support when communicating with the LM Studio OpenAI‑compatible endpoint.

## 1. Goal
* Add support for streaming responses while keeping normal (non‑stream) handling unchanged.
* Use the official API spec: https://lmstudio.ai/docs/developer/openai-compat/responses.
* Persist chat history in IndexedDB; display previously stored messages immediately on page load.
* Only **new** messages are streamed – earlier history should be loaded from IndexedDB and shown as regular content.

## 2. Key Types
```ts
// Normal completion response
export interface ChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason?: string;
  }>;
}

// Streaming chunk
export interface ChatCompletionChunk {
  id?: string; // optional in stream
  object?: "chat.completion.chunk";
  created?: number;
  model?: string;
  choices: Array<{
    index: number;
    delta: { content?: string };
    finish_reason?: string;
  }>;
}
```

## 3. Implementation Steps
1. **Add Types** – Extend `app/types/ai.ts` with `ChatCompletionChunk` and optional stream flag.
2. **Create Helper** – `parseChunk(chunk: string): ChatCompletionChunk | null` that JSON‑parses each line.
3. **Modify Fetch Logic** – In the chat store composable, detect `{stream:true}` in request payload. Use `response.body.getReader()` to read chunks line by line, applying them via helper.
4. **Store State** – Add `isStreaming: boolean` flag per message. When a streaming request starts, set it; clear on `finish_reason`.
5. **Persist During Streaming** – After each chunk, update IndexedDB entry for that message so history is consistent across reloads.
6. **UI Adjustments** – Ensure the component renders a loading indicator while `isStreaming` is true.
7. **Testing** – Add Vitest tests for parsing, store updates, and persistence.
8. **Documentation** – Comment code with LM Studio spec URL; update README if needed.

## 4. Risk Mitigations
- Use try/catch in `parseChunk` to avoid malformed JSON.
- Persist after every successful chunk to prevent data loss on reload.
- Keep original response types untouched for backward compatibility.

## 5. Next Steps
1. Create a new branch `feat/stream-support-plan`.
2. Commit this file with message "feat: add streaming support plan".
3. Proceed to implement the actual code changes following this design.
