<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { availableModels, selectedModel, fetchModels } from "@/services/lmStudio";
import { useChatStore } from "@/composables/useChatStore";
import { getChatCompletion } from "@/services/lmStudio";

const { sessions, createSession, addMessage, loadSessions } = useChatStore();
const newMessage = ref("");
const loading = ref(false);
const selectedSessionId = ref<number | null>(null);
const messagesEndRef = ref<HTMLElement>(null);

const isMobileMenuOpen = ref(false);
const showModelSelector = ref(false);
const modelSearch = ref("");
const modelsLoaded = ref(false);
const keys = availableModels.value;
const selectedModelKey = computed(() => selectedModel.value);

const filteredModels = computed(() => {
  const keys = availableModels.value;
  if (!modelSearch.value || !modelsLoaded.value) return keys;
  const search = modelSearch.value.toLowerCase().trim();
  return keys.filter((key) => key.toLowerCase().includes(search));
});

const isCurrentlySelected = computed(() => {
  if (!selectedModelKey.value) return false;
  const selectedKey = filteredModels.value.find((k) => k === selectedModelKey.value);
  return selectedKey;
});

const currentMessages = computed(() => {
  const session = sessions.value.find((s) => s.id === selectedSessionId.value);
  return session ? session.messages : [];
});

onMounted(async () => {
  await loadSessions();
  if (sessions.value.length && selectedSessionId.value === null) {
    selectedSessionId.value = sessions.value[0].id;
  }
  await fetchModels();
  modelsLoaded.value = true;
});

async function updateSelectedSession(id: number) {
  selectedSessionId.value = id;
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

async function send() {
  if (!newMessage.value) return;
  loading.value = true;
  const sessionId = selectedSessionId.value ?? (await createSession());
  await addMessage(sessionId, { role: "user", content: newMessage.value });
  try {
    const completion = await getChatCompletion([{ role: "user", content: newMessage.value }]);
    const assistantMsg = completion.choices?.[0]?.message || { role: "assistant", content: "" };
    await addMessage(sessionId, assistantMsg);
  } catch (e) {
    console.error("Chat API error", e);
    await addMessage(sessionId, { role: "assistant", content: "Error fetching response." });
  }
  selectedSessionId.value = sessionId;
  newMessage.value = "";
  loading.value = false;
  isMobileMenuOpen.value = false;
}
</script>

<template>
  <div class="w-full h-screen bg-gray-100 dark:bg-gray-900 flex">
    <MobileHeader />

    <SessionSidebar
      :sessions="sessions"
      :selectedSessionId="selectedSessionId"
      :onSessionSelect="updateSelectedSession"
      :onMenuToggle="toggleMobileMenu"
    />

    <MobileOverlay :isOpen="isMobileMenuOpen" @close="isMobileMenuOpen = false" />

    <main class="flex-1 flex flex-col h-full">
      <MessagesContainer :messages="currentMessages" :messagesEndRef="messagesEndRef" />

      <div v-if="selectedSessionId !== null" class="flex-1 flex flex-col h-full overflow-hidden">
        <InputArea
          :loading="loading"
          :onSend="send"
          :showModelSelector="showModelSelector"
          @toggleModelSelector="showModelSelector = $event"
        />
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
      >
        <svg
          class="w-16 h-16 mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p class="text-lg font-medium">Select a chat session to start messaging</p>
      </div>
    </main>

    <ModelSelector
      v-if="showModelSelector && modelsLoaded"
      :showModelSelector="showModelSelector"
      :availableModels="filteredModels"
      :selectedModelKey="selectedModelKey"
    />
  </div>
</template>
