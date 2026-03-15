<script setup lang="ts">
import { availableModels, selectedModel, fetchModels } from "@/services/lmStudio";
import { useChatStore, chatStore } from "@/composables/useChatStore";
import { getChatCompletion, getChatCompletionStream } from "@/services/lmStudio";
import MobileOverlay from "./MobileOverlay.vue";
import ModelSelector from "./ModelSelector.vue";

const { sessions, createSession, addMessage, loadSessions, isStreaming, updateLastMessage } = useChatStore();
const chatStoreInstance = chatStore;
const newMessage = ref<string>("");
const loading = ref<boolean>(false);
const selectedSessionId = ref<number | null>(null);
const isMobileMenuOpen = ref<boolean>(false);
const showModelSelector = ref<boolean>(false);
const modelSearch = ref<string>("");
const modelsLoaded = ref<boolean>(false);
const keys = availableModels.value;
const selectedModelKey = computed(() => selectedModel.value);

const filteredModels = computed(() => {
  const availableKeys = availableModels.value;
  if (!modelSearch.value || !modelsLoaded.value) return availableKeys;
  const search = modelSearch.value.toLowerCase().trim();
  return availableKeys.filter((key) => key.toLowerCase().includes(search));
});

const isCurrentlySelected = computed(() => {
  if (!selectedModelKey.value) return false;
  const selectedKey = filteredModels.value.find((k) => k === selectedModelKey.value);
  return !!selectedKey;
});

const currentMessages = computed(() => {
  const session = sessions.value.find((s) => s.id === selectedSessionId.value);
  return session ? [...session.messages] : [];
});

onMounted(async () => {
  await loadSessions();
  if (sessions.value.length > 0 && selectedSessionId.value === null) {
    const firstSession = sessions.value[0];
    selectedSessionId.value = firstSession.id ?? null;
  }
  await fetchModels();
  modelsLoaded.value = true;
});

async function updateSelectedSession(id?: number | null) {
  if (id === undefined || id === null) {
    // Create a new session when no ID is provided
    const newId = await createSession();
    selectedSessionId.value = newId;
  } else {
    selectedSessionId.value = id;
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

/**
 * Send message using non-streaming API
 */
async function sendNonStreaming() {
  if (!newMessage.value) return;
  
  loading.value = true;
  const sessionId = selectedSessionId.value ?? (await createSession());

  // Get current conversation history BEFORE adding new message
  const previousMessages = currentMessages.value; 

  await addMessage(sessionId, { role: "user", content: newMessage.value });

  // Build complete conversation history as context for the API call
  const messageHistory = [
    ...previousMessages.map(m => ({ ...m })),
    { role: "user", content: newMessage.value },
  ];

  try {
    const completion = await getChatCompletion(messageHistory);
    const assistantMsg = completion.choices?.[0]?.message || { role: "assistant", content: "" };
    await addMessage(sessionId, assistantMsg);
  } catch (e) {
    console.error("Chat API error", e);
    await addMessage(sessionId, { role: "assistant", content: "Error fetching response." });
  } finally {
    loading.value = false;
    isMobileMenuOpen.value = false;
  }
}

/**
 * Send message using streaming API
 */
async function sendStreaming() {
  if (!newMessage.value) return;
  
  loading.value = true;
  const sessionId = selectedSessionId.value ?? (await createSession());
  isStreaming.value = true;

  // Get current conversation history BEFORE adding new message
  const previousMessages = currentMessages.value; 

  await addMessage(sessionId, { role: "user", content: newMessage.value });

  // Build complete conversation history as context for the API call
  const messageHistory = [
    ...previousMessages.map(m => ({ ...m })),
    { role: "user", content: newMessage.value },
  ];

  try {
    let assistantContent = "";
    
    // Add an empty assistant message placeholder before streaming starts
    await addMessage(sessionId, { role: "assistant", content: "" });

    for await (const chunk of getChatCompletionStream(messageHistory)) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        assistantContent += delta;
        
        // Update the last message in place instead of pushing new ones
        await updateLastMessage(sessionId, assistantContent);
      }
    }
    
  } catch (e) {
    console.error("Chat API streaming error", e);
    await addMessage(sessionId, { role: "assistant", content: "Error fetching response." });
  } finally {
    loading.value = false;
    isStreaming.value = false;
    isMobileMenuOpen.value = false;
  }
}

async function send() {
  if (!newMessage.value) return;
  
  // Use streaming by default for better UX
  await sendStreaming();
}
</script>

<template>
  <div class="w-full h-screen bg-gray-100 dark:bg-gray-900 flex">
    <!-- Sidebar - Chat Sessions -->
    <SessionSidebar
      :sessions="sessions"
      v-model:selected-session-id="selectedSessionId"
      @menu-toggle="toggleMobileMenu"
      @session-select="updateSelectedSession"
    />

    <MobileOverlay :isOpen="isMobileMenuOpen" @close="isMobileMenuOpen = false" />

    <main class="flex-1 flex flex-col h-full">
      <div v-if="selectedSessionId !== null" class="flex flex-col h-full overflow-hidden">
        <MessagesContainer :messages="currentMessages" />
        <InputArea
          :loading="loading || isStreaming"
          v-model:message="newMessage"
          @toggle-model-selector="showModelSelector = !showModelSelector"
          @send="send"
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
      v-model:showModelSelector="showModelSelector"
      :availableModels="availableModels"
      :model-search="modelSearch"
      @select="
        (model) => {
          selectedModel = model;
          modelSearch = '';
        }
      "
      @update:model-search="modelSearch = $event"
      @close="showModelSelector = false"
    >
    </ModelSelector>
  </div>
</template>
