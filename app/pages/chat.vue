<template>
  <Chat />;
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import InputArea from "@/components/InputArea.vue";
import MessagesContainer from "@/components/MessagesContainer.vue";
import SessionSidebar from "@/components/SessionSidebar.vue";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { sessions, selectedModel } = useChatStore();
</script>