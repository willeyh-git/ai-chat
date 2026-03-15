<script setup lang="ts">
import { useTemplateRef, watch, onMounted } from "vue";
import type { Message } from "@/composables/useChatStore";

const props = defineProps<{
  messages: Message[];
}>();

const scrollRef = useTemplateRef<HTMLElement | null>("scrollRef");
let isScrolled = false;

// Scroll to bottom on initial mount
onMounted(() => {
  nextTick(() => {
    scrollToBottom();
  });
});

// Watch for message changes and scroll to bottom
watch(
  () => props.messages,
  () => {
    // Only watch once to avoid duplicate scrolls
    if (!isScrolled) {
      isScrolled = true;
    }

    nextTick(() => {
      scrollToBottom();
    });
  },
);

function scrollToBottom() {
  if (scrollRef.value) {
    scrollRef.value.scrollIntoView({ block: "end", behavior: "smooth" });
  }
}
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
