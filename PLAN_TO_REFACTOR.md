# Chat Component Refactoring Plan

## Overview
Refactor `Chat.vue` (479 lines) from a monolithic component into smaller, reusable components following Vue best practices and the project's existing architecture.

## Current Structure
- Single `Chat.vue` component with:
  - Mobile header
  - Sessions sidebar
  - Messages container
  - Input area
  - Model selector modal
  - User/Assistant message rendering

## Proposed Component Breakdown

### 1. User Message Component (`UserMessage.vue`)
- Displays user messages with avatar
- Props: `message` (interface with role, content)
- Reusable for all user messages

### 2. Assistant Message Component (`AssistantMessage.vue`)
- Displays assistant messages with avatar
- Props: `message` (interface with role, content)
- Reusable for all assistant messages

### 3. Session Sidebar Component (`SessionSidebar.vue`)
- Displays list of chat sessions
- Click to select session
- Props: `sessions` (array of session objects)
- Shows timestamp and message count per session

### 4. Messages Container Component (`MessagesContainer.vue`)
- Renders messages in chat flow
- Props: `messages` (array of messages)
- Handles scroll positioning
- Uses `messagesEndRef` for auto-scroll

### 5. Input Area Component (`InputArea.vue`)
- Message input field
- Send button with loading state
- Model selector toggle
- Props: `onSend` (callback), `showModelSelector` (boolean)

### 6. Model Selector Modal (`ModelSelector.vue`)
- Modal for selecting models
- Search functionality
- Shows currently selected model
- Props: `showModelSelector` (boolean), `availableModels` (array), `selectedModelKey` (string)

### 7. Mobile Overlay Component (`MobileOverlay.vue`)
- Overlay for mobile sidebar
- Simple click handler to close

### 8. Mobile Header Component (`MobileHeader.vue`)
- Mobile-only header
- Menu toggle button

## Data Flow

```
Chat.vue (main)
├── useChatStore composable
│   ├── sessions (session[])
│   ├── createSession()
│   ├── addMessage()
│   └── loadSessions()
├── lmStudio service
│   ├── availableModels
│   ├── selectedModel
│   ├── fetchModels()
│   └── getChatCompletion()
└── Component props pass data down
```

## Files to Create
1. `app/components/UserMessage.vue`
2. `app/components/AssistantMessage.vue`
3. `app/components/SessionSidebar.vue`
4. `app/components/MessagesContainer.vue`
5. `app/components/InputArea.vue`
6. `app/components/ModelSelector.vue`
7. `app/components/MobileOverlay.vue`
8. `app/components/MobileHeader.vue`

## Files to Modify
1. `app/components/Chat.vue` - Core logic remains, simplified template
2. `app/composables/useChatStore.ts` - No changes needed
3. `app/services/lmStudio.ts` - No changes needed

## Implementation Steps
1. Create message components (UserMessage, AssistantMessage)
2. Create session sidebar component
3. Extract messages container
4. Extract input area
5. Extract model selector modal
6. Extract mobile components
7. Refactor Chat.vue with new components
8. Test all functionality

## Benefits
- Reduced complexity (479 lines → ~200 lines in Chat.vue)
- Reusable components
- Easier testing
- Better maintainability
- Clear separation of concerns
