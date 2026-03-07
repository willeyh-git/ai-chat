# Plan for Nuxt 3 AI Chat Frontend

## 1️⃣ Project Overview
Build a Nuxt 3 frontend for chatting with an AI, styled with Tailwind CSS v4, persisting chat sessions via Dexie (IndexedDB) wrapped in a VueUse composable.

## 2️⃣ Dependency List
- Tailwind CSS v4 (via npm)
- Dexie for IndexedDB persistence
- VueUse composables (@vueuse/core, vue-demi)
- LM Studio client (or similar for API calls)

## 3️⃣ File‑by‑File Setup Plan
- **nuxt.config.ts**: Configure Nuxt to work with Vite and Tailwind (no PostCSS needed)
- **app/app.vue**: Root component, import Tailwind CSS
- **composables/useChatStore.ts**: Dexie wrapper for chat persistence in IndexedDB
- **tailwind.config.js** (optional): Custom Tailwind configuration if needed
- **vite.config.ts**: Add Tailwind plugin directly in Vite config

## 4️⃣ Tailwind Integration Steps
1. Install via npm: `npm install tailwindcss@4`
2. Create **tailwind.config.js** (if customizing)
3. Import Tailwind in **app/app.vue**: `@import "tailwindcss/tailwind.css";`
4. Alternatively, use CDN in **app.vue**

## 5️⃣ Dexie Store Design
- Chat sessions stored with timestamps, AI responses, and user input
- Wrap Dexie in VueUse composable for reactive state management
- Schema: `chatSessions` → {id, createdAt, messages: [{role, content}]}

## 6️⃣ UI Skeleton
- Chat list component (existing sessions)
- Message input with send button
- Status indicators for loading/sending/responses
- Basic styling with Tailwind (dark mode optional)

## 7️⃣ API Interaction Stub
- Placeholder service for LM Studio: `/v1/chat/completions`
- Handle API key (env variable)
- Error handling for failed requests

## 8️⃣ Testing Strategy
- Vitest for store logic and component rendering
- Test Persistence: Verify Dexie saves/retrieves messages
- API Mocking: Test UI behavior with mocked responses

## 9️⃣ Next Steps
1. Install dependencies (Tailwind, Dexie)
2. Set up Tailwind CSS in project
3. Create Dexie composable (`useChatStore.ts`)
4. Build basic chat UI skeleton
5. Stub API calls to LM Studio