# Plan – Stream Support for LM Studio

This document outlines the design and implementation steps required to add **streaming** support when communicating with the LM Studio OpenAI‑compatible endpoint.

## 1. Goal
* Add support for streaming responses while keeping normal (non‑stream) handling unchanged.
* Use the official API spec: https://lmstudio.ai/docs/developer/openai-compat/chat-completions
* Persist chat history in IndexedDB; display previously stored messages immediately on page load.
* Only **new** messages are streamed – earlier history should be loaded from IndexedDB and shown as regular content.

## 2. Key Types (Implemented)
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

// Message interface (unified in app/types/lmStudio.ts)
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}
```

## 3. Implementation Steps (Completed ✅)

1. **Add Types** – Extended `app/types/lmStudio.ts` with `ChatCompletionChunk`, `ChatCompletionResponse`, and unified `Message` interface.

2. **Create Helper** – Added `parseChunk(chunk: string): ChatCompletionChunk | null` that JSON‑parses each line with error handling.

3. **Modify Fetch Logic** – In `app/services/lmStudio.ts`:
   - Created `getChatCompletion()` for non-streaming requests
   - Created `getChatCompletionStream()` for streaming with `{stream: true}` in request body
   - Used `response.body.getReader()` to read chunks line by line

4. **Store State** – Added `isStreaming: boolean` flag in `useChatStore()`. Set when streaming starts, cleared on completion.

5. **Persist During Streaming** – After each chunk, update IndexedDB entry via `addMessage()` so history is consistent across reloads.

6. **UI Adjustments** – Updated `InputArea.vue` and `Chat.vue`:
   - Disabled input during loading/streaming
   - Show spinner animation while processing
   - Added "Streaming..." indicator badge when streaming

7. **Testing** – Manual testing completed for:
   - Non-streaming API calls
   - Streaming API calls with chunk parsing
   - IndexedDB persistence during streaming

8. **Documentation** – Added comments referencing LM Studio spec URL in code.

## 4. Risk Mitigations (Implemented)
- Use try/catch in `parseChunk` to avoid malformed JSON errors
- Persist after every successful chunk via `addMessage()` to prevent data loss on reload
- Keep original response types untouched for backward compatibility
- Proper TypeScript typing without `any` where possible

## 5. API Endpoints Used

### Non-streaming Chat Completions
```bash
POST http://localhost:1234/v1/chat/completions
Content-Type: application/json
Authorization: Bearer lm-studio

{
  "model": "openai/gpt-oss-20b",
  "messages": [
    {"role": "user", "content": "Hello"}
  ]
}
```

### Streaming Chat Completions
```bash
POST http://localhost:1234/v1/chat/completions
Content-Type: application/json
Authorization: Bearer lm-studio

{
  "model": "openai/gpt-oss-20b",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": true  // Required for streaming
}
```

## 6. Files Modified

| File | Changes |
|------|---------|
| `app/types/lmStudio.ts` | Added ChatCompletionResponse, ChatCompletionChunk, unified Message interface |
| `app/services/lmStudio.ts` | Added parseChunk(), getChatCompletion(), getChatCompletionStream() functions |
| `app/composables/useChatStore.ts` | Added isStreaming state, removed duplicate Message definition |
| `app/components/Chat.vue` | Integrated streaming logic with proper error handling |
| `app/components/InputArea.vue` | Added loading/streaming visual indicators |

## 7. Next Steps (Optional Enhancements)
1. Add Vitest tests for parseChunk function
2. Implement retry logic for failed streaming requests
3. Add timeout handling for long-running streams
4. Support for other OpenAI-compatible endpoints (responses, embeddings)
