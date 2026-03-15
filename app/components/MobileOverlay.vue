<script setup lang="ts">
const props = defineProps<{
  isOpen?: boolean;
}>();

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div v-if="isOpen" @click="$emit('close')" class="fixed inset-0 bg-black/50 z-10 md:hidden" />
</template>
