<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { availableModels, selectedModel, fetchModels } from "@/services/lmStudio";
import { useChatStore } from "@/composables/useChatStore";
import { getChatCompletion } from "@/services/lmStudio";

const { sessions, createSession, addMessage, loadSessions } = useChatStore();

// Reactive list of available models
const modelKeys = availableModels;
const selectedModelKey = selectedModel;

const newMessage = ref("");
const loading = ref(false);
const selectedSessionId = ref<number | null>(null);
const messagesEndRef = ref<HTMLElement>(null);
const isMobileMenuOpen = ref(false);

onMounted(async () => {
  await loadSessions();
  if (sessions.value.length && selectedSessionId.value === null) {
    selectedSessionId.value = sessions.value[0].id;
  }
  await fetchModels();
});

const currentMessages = computed(() => {
  const session = sessions.value.find((s) => s.id === selectedSessionId.value);
  return session ? session.messages : [];
});

// Auto-scroll to bottom when messages update
watch(currentMessages, () => {
  messagesEndRef.value?.scrollIntoView({ behavior: "smooth" });
}, { deep: true });

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
    <div class="md:hidden fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <h1 class="text-lg font-semibold text-gray-800 dark:text-gray-200">AI Chat</h1>
      <button @click="toggleMobileMenu" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
        <svg v-if="!isMobileMenuOpen" class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Sessions Sidebar -->
    <aside
      :class="[
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 ease-in-out flex flex-col',
        isMobileMenuOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full md:w-80 md:translate-x-0',
        'absolute md:relative z-0 h-full md:h-screen'
      ]"
    >
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Chat Sessions</h2>
        <button @click="toggleMobileMenu" class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex-1">
        <ul class="divide-y divide-gray-100 dark:divide-gray-700">
          <li
            v-for="s in sessions"
            :key="s.id"
            @click="selectedSessionId = s.id; isMobileMenuOpen = false"
            :class="{ 'bg-blue-50 dark:bg-blue-900/30 border-r-4 border-r-blue-500': selectedSessionId === s.id }"
            class="cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div class="p-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {{ new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
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
        class="fixed inset-0 bg-black/50 z-0 md:hidden"
      />

      <div v-if="selectedSessionId !== null" class="flex-1 flex flex-col h-full overflow-hidden">
        <!-- Messages Container -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div
            v-for="(m, idx) in currentMessages"
            :key="idx"
            class="flex gap-3"
          >
            <!-- User Message -->
            <div v-if="m.role === 'user'" class="flex gap-3 max-w-[80%]">
              <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-2xl rounded-tl-none p-4 shadow-sm">
                <p class="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{{ m.content }}</p>
              </div>
            </div>

            <!-- Assistant Message -->
            <div v-else class="flex gap-3 max-w-[80%]">
              <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-none p-4 shadow-sm">
                <p class="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{{ m.content }}</p>
              </div>
            </div>
          </div>
          <div ref="messagesEndRef" />
        </div>

        <!-- Model Selector -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <label for="model-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Model
          </label>
          <select
            id="model-select"
            v-model="selectedModelKey"
            class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
            :disabled="loading"
          >
            <option disabled value="">-- Choose a model --</option>
            <option v-for="key in modelKeys" :key="key" :value="key">{{ key }}</option>
          </select>
          <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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
              <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          </div>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Press Enter to send
          </p>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-lg font-medium">Select a chat session to start messaging</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Custom scrollbar for better aesthetics */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
