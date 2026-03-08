<script setup lang="ts">
const isOpen = defineModel<boolean>({ default: false });
</script>

<template>
  <div v-if="isOpen" @click="$emit('close')" class="fixed inset-0 bg-black/50 z-10 md:hidden" />
</template>
