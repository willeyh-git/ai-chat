<script setup lang="ts">
import { useChatStore } from "@/composables/useChatStore";


const emit = defineEmits(["send", "update"]);

const { selectedModel } = useChatStore();

interface Props {
  loading: boolean;
  showModelSelector?: boolean;
}

const props = defineProps<Props>();
const message = defineModel<string>({ default: "" });

function handleSend() {
  emit("send", message.value);
}

function toggleModelSelector() {
  emit("update", !props.showModelSelector);
}
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
    <div class="flex gap-3">
      <input
        v-model="message"
        type="text"
        placeholder="Type a message..."
        @keydown.enter.stop="!loading && handleSend()"
        class="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        :disabled="loading"
        autocomplete="off"
      />
      <button
        @click="handleSend"
        :disabled="loading || !message"
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
        @click="toggleModelSelector"
        class="px-4 py-3 border rounded-lg transition-all duration-200 flex items-center gap-2"
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
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">{{
          selectedModel
        }}</span>
        <svg
          class="w-4 h-4 text-gray-500 transition-transform"
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
</template>
