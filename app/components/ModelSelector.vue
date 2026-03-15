<script setup lang="ts">
import { availableModels, selectedModel } from "@/services/lmStudio";

const props = defineProps<{
  showModelSelector?: boolean;
  isMobileMenuOpen?: boolean;
}>();

const isOpen = props.showModelSelector;
const searchQuery = ref("");
const modelSearchQuery = ref("");
const emit = defineEmits<{
  select: [model: string];
  "update:model-search": [query: string];
  update: [];
  close: [];
}>();

const filteredModels = computed(() => {
  const query = modelSearchQuery.value || searchQuery.value;
  if (!query) return availableModels.value;
  const search = query.toLowerCase().trim();
  return availableModels.value.filter((key) => key.toLowerCase().includes(search));
});

const isCurrentlySelected = computed(() => {
  const selectedKey = filteredModels.value.find((k) => k === selectedModel.value);
  return selectedKey;
});

function handleSearch() {
  emit("update:model-search", modelSearchQuery.value);
}

function handleSelect(model: string) {
  emit("select", model);
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div @click="emit('update')" class="fixed inset-0 bg-black/50 transition-opacity" />
    <div
      class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 max-h-[70vh] flex flex-col"
      @click="emit('update')"
    >
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Select Model</h2>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ filteredModels.length }} models
          </span>
        </div>
        <div class="relative">
          <input
            v-model="modelSearchQuery"
            type="text"
            :placeholder="
              !isCurrentlySelected
                ? 'Search models...'
                : 'Search models... (use arrow keys to navigate)'
            "
            @input="handleSearch"
            @blur="handleSearch"
            class="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <svg
            class="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div
          v-if="isCurrentlySelected"
          class="px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-blue-700 dark:text-blue-300"
              >Currently selected:</span
            >
            <span class="text-sm font-semibold text-blue-700 dark:text-blue-300">{{
              isCurrentlySelected
            }}</span>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <div
          v-if="filteredModels.length === 0"
          class="text-center py-8 text-gray-500 dark:text-gray-400"
        >
          <p>No models found</p>
        </div>
        <div class="space-y-2">
          <button
            v-for="model in filteredModels"
            :key="model"
            @click="handleSelect(model)"
            :class="[
              'w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between',
              isCurrentlySelected === model
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
            ]"
          >
            <span>{{ model }}</span>
            <svg
              v-if="isCurrentlySelected === model"
              class="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
      </div>
      <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button
          @click="emit('close')"
          class="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
