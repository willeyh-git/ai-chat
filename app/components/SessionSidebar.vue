<template>
  <aside
    class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300 ease-in-out flex flex-col absolute md:relative z-0 h-full md:h-screen md:z-10"
  >
    <!-- Header with "New Chat" button -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Chat Sessions
      </h2>
      <button
        @click="onMenuToggle"
        class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 absolute right-4 top-1/2 -translate-y-1/2"
      >
        <svg
          class="w-5 h-5 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <div class="flex items-center gap-2 mt-3">
        <button
          @click="handleNewChat"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-md"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          New Chat
        </button>
      </div>
    </div>

    <!-- Session List -->
    <div class="flex-1">
      <ul class="divide-y divide-gray-100 dark:divide-gray-700">
        <li
          v-for="s in sessions"
          :key="s.id!"
          @click="onSessionSelect(s.id!)"
          :class="{
            'bg-blue-50 dark:bg-blue-900/30 border-r-4 border-r-blue-500':
              selectedSessionId === s.id,
          }"
          class="cursor-pointer transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <div class="p-4">
            <div class="flex items-center gap-3">
              <!-- Time and Title Preview -->
              <span class="text-xs text-gray-400 whitespace-nowrap">{{
                new Date(s.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}</span>
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate"
                >
                  {{ s.title || "Untitled" }}
                </p>
              </div>
              <!-- Message Count -->
              <span class="text-xs text-gray-400 whitespace-nowrap">{{
                s.messages.length
              }}</span>
            </div>

            <!-- Session Actions (inline buttons) -->
            <div
              class="flex items-center gap-1 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800"
            >
              <button
                @click.stop="handleActions(s.id!, 'edit', s.title)"
                class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors"
                title="Edit title"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                @click.stop="handleActions(s.id!, 'duplicate')"
                class="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/30 rounded transition-colors"
                title="Duplicate session"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 9h2a2 2 0 002-2V7a2 2 0 01-2-2H6a2 2 0 00-2 2v2a2 2 0 012 2zm5-9l3.857-2.485c.905-.567 1.745.512 1.745 1.5v6c0 .986-1.189 1.05-1.5 1.43L14.125 17H14a2 2 0 00-2-2h-3z"
                  />
                </svg>
              </button>
              <button
                @click.stop="handleActions(s.id!, 'delete')"
                class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded transition-colors"
                title="Delete session"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useChatStore, type ChatSession } from "#imports";

const props = withDefaults(
  defineProps<{
    sessions: readonly ChatSession[];
    selectedSessionId: number | null;
  }>(),
  {
    sessions: [],
    selectedSessionId: null,
  }
);

const emit = defineEmits<{ menuToggle: []; sessionSelect: [id: number] }>();

function onMenuToggle() {
  emit("menuToggle");
}

function onSessionSelect(id: number) {
  emit("sessionSelect", id);
}

async function handleNewChat() {
  // Emit session select to trigger creation
  await emit("sessionSelect", undefined as number | null); // Will be handled by parent
}

async function handleActions(
  sessionId: number,
  action: "edit" | "duplicate" | "delete",
  currentTitle?: string,
) {
  switch (action) {
    case "edit":
      // Trigger edit dialog with current title
      console.log("Edit session", sessionId, currentTitle);
      break;

    case "duplicate":
      try {
        await emitStore.duplicateSession(sessionId);
        onMenuToggle();
      } catch (e) {
        console.error("Failed to duplicate session", e);
      }
      break;

    case "delete":
      if (confirm(`Delete session "${currentTitle || ""}"?`)) {
        try {
          await emitStore.deleteSession(sessionId);
          onMenuToggle();
        } catch (e) {
          console.error("Failed to delete session", e);
        }
      }
      break;
  }
}

const emitStore = useChatStore();
</script>
