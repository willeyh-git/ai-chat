<script setup lang="ts">
interface Props {
  content: string;
}

defineProps<Props>();
</script>

<template>
  <div class="flex gap-3 max-w-[80%]">
    <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-none p-4 shadow-sm">
      <p class="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
        {{ content }}
      </p>
    </div>
  </div>
</template>