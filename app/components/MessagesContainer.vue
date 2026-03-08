<script setup lang="ts">
import { ref } from "vue";
import type { Message } from "@/composables/useChatStore";

import { nextTick, watch } from "vue";
const props = defineProps<{
  messages: Message[];
  messagesEndRef?: HTMLElement | null;
}>();

const messagesEndRef = ref<HTMLElement>(null);

const scrollRef = ref<HTMLElement | null>(null);

// Track when messages change to scroll to bottom
let isWatching = false;

watch(
  () => props.messages,
  () => {
    // Only start watching once to avoid triggering on initial mount
    if (!isWatching) {
      isWatching = true;
    }

    nextTick(() => {
      // Use scrollIntoView with block: "end" to ensure element is at bottom
      if (scrollRef.value) {
        scrollRef.value.scrollIntoView({ block: "end", behavior: "smooth" });
      }
    });
  },
);
</script>

<template>
  <div
    class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
  >
    <div v-for="(m, idx) in messages" :key="idx" class="flex gap-3">
      <UserMessage v-if="m.role === 'user'" :content="m.content" />
      <AssistantMessage v-else :content="m.content" />
    </div>
    <div ref="scrollRef" />
  </div>
</template>

<style scoped></style>
