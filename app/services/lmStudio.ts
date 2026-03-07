import axios from "axios";

const API_URL = process.env.LM_STUDIO_API_URL || "http://192.168.68.128:1234/v1/chat/completions";
const API_KEY = process.env.LM_STUDIO_API_KEY || "";

export async function getChatCompletion(messages: { role: string; content: string }[]) {
  const response = await axios.post(
    API_URL,
    {
      model: "openai/gpt-oss-20b",
      messages,
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    },
  );
  return response.data;
}
