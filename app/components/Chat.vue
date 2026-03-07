<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { getChatCompletion } from "@/services/lmStudio";
import { useChatStore } from "@/composables/useChatStore";

const { sessions, createSession, addMessage, loadSessions } = useChatStore();
const newMessage = ref("");
const loading = ref(false);
const selectedSessionId = ref<number | null>(null);

const currentMessages = computed(() => {
  const session = sessions.value.find((s) => s.id === selectedSessionId.value);
  return session ? session.messages : [];
});

onMounted(() => {
  loadSessions();
});

async function send() {
  if (!newMessage.value) return;
  loading.value = true;
  const sessionId = selectedSessionId.value ?? (await createSession());
  await addMessage(sessionId, { role: "user", content: newMessage.value });
  // Call LM Studio API and store response
  const completion = await getChatCompletion([{ role: "user", content: newMessage.value }]);
  const assistantMsg = completion.choices?.[0]?.message || { role: "assistant", content: "" };
  await addMessage(sessionId, assistantMsg);
  selectedSessionId.value = sessionId;
  newMessage.value = "";
  loading.value = false;
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto p-4 bg-white dark:bg-gray-800 rounded shadow">
    <ul class="space-y-2 mb-4">
      <li
        v-for="s in sessions"
        :key="s.id"
        @click="selectedSessionId = s.id"
        :class="{ 'bg-blue-100': selectedSessionId === s.id }"
        class="border-b pb-2 cursor-pointer p-1 rounded"
      >
        {{ new Date(s.createdAt).toLocaleTimeString() }}
      </li>
    </ul>
    <div v-if="selectedSessionId !== null">
      <ul class="space-y-2 mb-4">
        <li
          v-for="(m, idx) in currentMessages"
          :key="idx"
          class="p-2 rounded bg-gray-100 dark:bg-gray-700"
        >
          <strong>{{ m.role }}:</strong> {{ m.content }}
        </li>
      </ul>
      <div class="flex space-x-2 mt-4">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message…"
          class="flex-1 border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700"
        />
        <button
          @click="send"
          :disabled="loading || !newMessage"
          class="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</template>
