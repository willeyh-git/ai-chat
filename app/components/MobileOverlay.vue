<script setup lang="ts">
interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();

defineExpose({
  close: () => {
    props.isOpen = false;
  },
});
</script>

<template>
  <div v-if="isOpen" @click="$emit('close')" class="fixed inset-0 bg-black/50 z-10 md:hidden" />
</template>
