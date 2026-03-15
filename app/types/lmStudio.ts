/**
 * OpenAI-compatible Chat Completion Response
 * See: https://platform.openai.com/docs/api-reference/chat/object
 */
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

/**
 * OpenAI-compatible Chat Completion Chunk (Streaming)
 * See: https://platform.openai.com/docs/api-reference/chat/streaming
 */
export interface ChatCompletionChunk {
  id?: string;
  object?: "chat.completion.chunk";
  created?: number;
  model?: string;
  choices: Array<{
    index: number;
    delta: { content?: string };
    finish_reason?: string;
  }>;
}

/**
 * Message in a chat conversation
 */
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}
