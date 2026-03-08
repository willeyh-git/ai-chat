<script setup lang="ts">
defineEmits(['toggle']);
</script>

<template>
  <div
    class="md:hidden fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between"
  >
    <h1 class="text-lg font-semibold text-gray-800 dark:text-gray-200">AI Chat</h1>
    <button @click="$emit('toggle')" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
      <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>
</template>