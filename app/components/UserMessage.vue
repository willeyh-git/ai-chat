<script setup lang="ts">
interface Props {
  content: string;
}

defineProps<Props>();
</script>

<template>
  <div class="flex gap-3 max-w-[80%]">
    <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
    <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-2xl rounded-tl-none p-4 shadow-sm">
      <p class="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
        {{ content }}
      </p>
    </div>
  </div>
</template>