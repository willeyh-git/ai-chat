import { describe, it, expect } from 'vitest';
import { parseChunk } from './lmStudio';
import type { ChatCompletionChunk } from '@/types/lmStudio';

describe('parseChunk', () => {
  const validChunks: Array<{ raw: string; expected: Partial<ChatCompletionChunk> }> = [
    {
      raw: '{"id":"test-123","object":"chat.completion.chunk","created":1234567890,"model":"openai/gpt-oss-20b","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":"stop"}]}',
      expected: {
        id: 'test-123',
        object: 'chat.completion.chunk',
        created: 1234567890,
        model: 'openai/gpt-oss-20b',
        choices: [{ index: 0, delta: { content: 'Hello' }, finish_reason: 'stop' }],
      },
    },
    {
      raw: '{"id":"stream-456","object":"chat.completion.chunk","created":1710508800,"model":"openai/gpt-oss-20b","choices":[{"index":0,"delta":{"content":"World"},"finish_reason":""}]}',
      expected: {
        id: 'stream-456',
        object: 'chat.completion.chunk',
        created: 1710508800,
        model: 'openai/gpt-oss-20b',
        choices: [{ index: 0, delta: { content: 'World' } }],
      },
    },
    {
      raw: '{"id":"partial","object":"chat.completion.chunk","created":1710508800,"model":"openai/gpt-oss-20b","choices":[{"index":0,"delta":{"content":"Partial"},"finish_reason":""}]}',
      expected: {
        id: 'partial',
        object: 'chat.completion.chunk',
        created: 1710508800,
        model: 'openai/gpt-oss-20b',
        choices: [{ index: 0, delta: { content: 'Partial' } }],
      },
    },
  ];

  const invalidChunks = [
    '', // Empty string
    '   ', // Whitespace only
    null, // Null (should be handled by caller)
    '{invalid json}', // Malformed JSON
    '{"incomplete":', // Incomplete JSON object
    'not a json at all', // Plain text
  ];

  describe('valid chunks', () => {
    it.each(validChunks)(
      'parses valid chunk correctly',
      ({ raw, expected }) => {
        const result = parseChunk(raw);

        expect(result).not.toBeNull();
        expect(result?.id).toBe(expected.id);
        expect(result?.object).toBe(expected.object);
        expect(result?.created).toBe(expected.created);
        expect(result?.model).toBe(expected.model);
        if (result?.choices && expected.choices) {
          expect(result.choices[0].index).toBe(expected.choices[0].index);
          expect(result.choices[0].delta.content).toBe(expected.choices[0].delta.content);
          if (expected.choices[0]?.finish_reason) {
            expect(result.choices[0]?.finish_reason).toBe(expected.choices[0]?.finish_reason);
          }
        }
      },
    );
  });

  describe('invalid chunks', () => {
    it.each(invalidChunks)(
      'returns null for invalid chunk: %s',
      (raw) => {
        const result = parseChunk(raw as string | null);

        expect(result).toBeNull();
      },
    );
  });

  describe('edge cases', () => {
    it('handles empty string and returns null', () => {
      const result = parseChunk('');
      expect(result).toBeNull();
    });

    it('handles whitespace only and returns null', () => {
      const result = parseChunk('   ');
      expect(result).toBeNull();
    });

    it('handles chunk with optional fields omitted', () => {
      const raw = '{"choices":[{"index":0,"delta":{"content":"Test"}}]}';
      const result = parseChunk(raw);

      expect(result).not.toBeNull();
      expect(result?.id).toBeUndefined();
      expect(result?.object).toBeUndefined();
      expect(result?.created).toBeUndefined();
      expect(result?.model).toBeUndefined();
      if (result?.choices) {
        expect(result.choices[0].delta.content).toBe('Test');
      }
    });

    it('handles chunk with empty delta content', () => {
      const raw = '{"id":"empty-content","object":"chat.completion.chunk","created":123,"model":"test","choices":[{"index":0,"delta":{"content":""},"finish_reason":"stop"}]}';
      const result = parseChunk(raw);

      expect(result).not.toBeNull();
      if (result?.choices) {
        expect(result.choices[0].delta.content).toBe('');
      }
    });

    it('handles chunk with special characters in content', () => {
      const raw = '{"id":"special","object":"chat.completion.chunk","created":123,"model":"test","choices":[{"index":0,"delta":{"content":"Hello <World> & Test"},"finish_reason":""}]}';
      const result = parseChunk(raw);

      expect(result).not.toBeNull();
      if (result?.choices) {
        expect(result.choices[0].delta.content).toBe('Hello <World> & Test');
      }
    });

    it('handles chunk with numeric content', () => {
      const raw = '{"id":"numeric","object":"chat.completion.chunk","created":123,"model":"test","choices":[{"index":0,"delta":{"content":"42"},"finish_reason":""}]}';
      const result = parseChunk(raw);

      expect(result).not.toBeNull();
      if (result?.choices) {
        expect(result.choices[0].delta.content).toBe('42');
      }
    });

    it('handles chunk with unicode content', () => {
      const raw = '{"id":"unicode","object":"chat.completion.chunk","created":123,"model":"test","choices":[{"index":0,"delta":{"content":"Hello 世界 🌍"},"finish_reason":""}]}';
      const result = parseChunk(raw);

      expect(result).not.toBeNull();
      if (result?.choices) {
        expect(result.choices[0].delta.content).toBe('Hello 世界 🌍');
      }
    });

    it('handles chunk with newlines in content', () => {
      const raw = '{"id":"newlines","object":"chat.completion.chunk","created":123,"model":"test","choices":[{"index":0,"delta":{"content":"Line 1\\nLine 2"},"finish_reason":""}]}';
      const result = parseChunk(raw);

      expect(result).not.toBeNull();
      if (result?.choices) {
        expect(result.choices[0].delta.content).toBe('Line 1\nLine 2');
      }
    });
  });
});
