<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
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

onMounted(async () => {
  await loadSessions();
  if (sessions.value.length && selectedSessionId.value === null) {
    selectedSessionId.value = sessions.value[0].id;
  }
  await fetchModels();
  modelsLoaded.value = true;
});

const currentMessages = computed(() => {
  const session = sessions.value.find((s) => s.id === selectedSessionId.value);
  return session ? session.messages : [];
});

watch(
  currentMessages,
  () => {
    messagesEndRef.value?.scrollIntoView({ behavior: "smooth" });
  },
  { deep: true },
);

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

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}
</script>

<template>
  <div class="w-full h-screen bg-gray-100 dark:bg-gray-900 flex">
    <!-- Mobile Header -->
    <div
      class="md:hidden fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between"
    >
      <h1 class="text-lg font-semibold text-gray-800 dark:text-gray-200">AI Chat</h1>
      <button
        @click="toggleMobileMenu"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <svg
          v-if="!isMobileMenuOpen"
          class="w-6 h-6 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <svg
          v-else
          class="w-6 h-6 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Sessions Sidebar -->
    <aside
      :class="[
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 ease-in-out flex flex-col',
        isMobileMenuOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full md:w-80 md:translate-x-0',
        'absolute md:relative z-0 h-full md:h-screen',
      ]"
    >
      <div
        class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
      >
        <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Chat Sessions</h2>
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg
            class="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="flex-1">
        <ul class="divide-y divide-gray-100 dark:divide-gray-700">
          <li
            v-for="s in sessions"
            :key="s.id"
            @click="
              selectedSessionId = s.id;
              isMobileMenuOpen = false;
            "
            :class="{
              'bg-blue-50 dark:bg-blue-900/30 border-r-4 border-r-blue-500':
                selectedSessionId === s.id,
            }"
            class="cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div class="p-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {{
                    new Date(s.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ s.messages.length }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main Chat Area -->
    <main class="flex-1 flex flex-col h-full">
      <!-- Mobile Overlay -->
      <div
        v-if="isMobileMenuOpen"
        @click="isMobileMenuOpen = false"
        class="fixed inset-0 bg-black/50 z-10 md:hidden"
      />

      <div v-if="selectedSessionId !== null" class="flex-1 flex flex-col h-full overflow-hidden">
        <!-- Messages Container -->
        <div
          class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
        >
          <div v-for="(m, idx) in currentMessages" :key="idx" class="flex gap-3">
            <!-- User Message -->
            <div v-if="m.role === 'user'" class="flex gap-3 max-w-[80%]">
              <div
                class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"
              >
                <svg
                  class="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div
                class="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-2xl rounded-tl-none p-4 shadow-sm"
              >
                <p class="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {{ m.content }}
                </p>
              </div>
            </div>

            <!-- Assistant Message -->
            <div v-else class="flex gap-3 max-w-[80%]">
              <div
                class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
              >
                <svg
                  class="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div
                class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-none p-4 shadow-sm"
              >
                <p class="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {{ m.content }}
                </p>
              </div>
            </div>
          </div>
          <div ref="messagesEndRef" />
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div class="flex gap-3">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type a message..."
              @keydown.enter.stop="!loading && send()"
              class="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              :disabled="loading"
              autocomplete="off"
            />
            <button
              @click="send"
              :disabled="loading || !newMessage"
              class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              <svg
                v-if="loading"
                class="w-5 h-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Send
            </button>
            <button
              @click="showModelSelector = !showModelSelector"
              :class="[
                'px-4 py-3 border rounded-lg transition-all duration-200 flex items-center gap-2',
                showModelSelector
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50',
              ]"
            >
              <svg
                class="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline"
                >Model</span
              >
              <svg
                class="w-4 h-4 text-gray-500 transition-transform"
                :class="{ 'rotate-180': showModelSelector }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center hidden sm:block">
            Press Enter to send
          </p>
        </div>
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

    <!-- Model Selector Modal -->
    <div
      v-if="showModelSelector && modelsLoaded"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        @click="showModelSelector = false"
        class="fixed inset-0 bg-black/50 transition-opacity"
      />
      <div
        class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 max-h-[70vh] flex flex-col"
      >
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Select Model</h2>
            <span class="text-xs text-gray-500 dark:text-gray-400"
              >{{ filteredModels.length }} models</span
            >
          </div>
<div class="relative">
    <input
      v-model="modelSearch"
      type="text"
      :placeholder="!isModelSelected ? 'Search models...' : 'Search models... (use arrow keys to navigate)'"
      class="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
    />
    <svg
      class="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  </div>
  
  <div v-if="isCurrentlySelected" class="px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-blue-700 dark:text-blue-300">
        Currently selected:
      </span>
      <span class="text-sm font-semibold text-blue-700 dark:text-blue-300">
        {{ isCurrentlySelected }}
      </span>
    </div>
  </div>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
          <div
            v-if="filteredModels.length === 0"
            class="text-center py-8 text-gray-500 dark:text-gray-400"
          >
            <p>No models found</p>
          </div>
          <div class="space-y-2">
            <button
              v-for="key in filteredModels"
              :key="key"
              @click="
                selectedModelKey = key;
                showModelSelector = false;
              "
              :class="[
                'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between',
                isCurrentlySelected === key
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
              ]"
            >
              <span>{{ key }}</span>
              <svg
                v-if="isCurrentlySelected === key"
                class="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            @click="showModelSelector = false"
            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
