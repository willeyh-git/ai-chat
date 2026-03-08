<script setup lang="ts">
import { ref } from "vue";
import type { Message } from "@/composables/useChatStore";

import { nextTick, watch } from "vue";
const props = defineProps<{
  messages: Message[];
  messagesEndRef?: HTMLElement | null;
}>();

const messagesEndRef = ref<HTMLElement>(null);

watch(
  () => props.messages,
  () => {
    nextTick(() => {
      scrollRef.value?.scrollIntoView({ behavior: "smooth" });
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
