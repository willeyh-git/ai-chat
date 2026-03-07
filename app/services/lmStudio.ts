import axios from "axios";

const API_URL = process.env.LM_STUDIO_API_URL || "http://192.168.68.128:1234/v1/chat/completions";
const API_KEY = process.env.LM_STUDIO_API_KEY || "";

import { ref } from "vue";

export const availableModels = ref<string[]>([]);
export const selectedModel = ref<string>('openai/gpt-oss-20b');

export async function fetchModels() {
  try {
    const res = await axios.get('http://192.168.68.128:1234/v1/models');
    // response structure: { data: [{ id, ... }, ...] }
    const ids = (res.data?.data || []).map((m: any) => m.id);
    availableModels.value = ids;
    if (!ids.includes(selectedModel.value)) {
      selectedModel.value = ids[0] ?? '';
    }
  } catch (e) {
    console.error('Failed to fetch models', e);
  }
}

export async function getChatCompletion(messages: { role: string; content: string }[]) {
  const response = await axios.post(
    API_URL,
    {
      model: selectedModel.value,
      messages,
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );
  return response.data;
}

