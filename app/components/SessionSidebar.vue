<script setup lang="ts">
import type { ChatSession } from "#imports";

const props = defineProps<{
  sessions: ChatSession[];
  selectedSessionId: number | null;
}>();
const emit = defineEmits<{ menuToggle: []; sessionSelect: [id: number] }>();
</script>

<template>
  <aside
    class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 ease-in-out flex flex-col absolute md:relative z-0 h-full md:h-screen md:z-10"
  >
    <div
      class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
    >
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Chat Sessions</h2>
      <button
        @click="onMenuToggle"
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
          @click="onSessionSelect(s.id)"
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
              <span class="text-xs text-gray-400">{{ s.messages.length }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </aside>
</template>
