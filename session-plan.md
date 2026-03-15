# Multi Chat Sessions Feature Plan

## Overview
This document outlines the implementation plan for adding multiple chat sessions functionality to the ai-chat application. The app already has foundational support via `useChatStore.ts`, but needs UI enhancements and additional features to make this a complete feature.

---

## Goals
1. Allow users to create, view, and manage multiple chat sessions concurrently
2. Add session titles for better organization
3. Provide session actions (delete, duplicate)
4. Show last message preview in session list
5. Enable editing of session titles
6. Ensure mobile-responsive UI

---

## Implementation Steps

### Phase 1: Setup Branch ✅
- [x] Create feature branch from main
- [x] Set up tracking for progress

### Phase 2: Type Definitions ✅
- [x] Add `title` property to `ChatSession` interface in `useChatStore.ts`
- [x] Default title should be auto-generated from first user message or timestamp

### Phase 3: Store Enhancements ✅
- [x] Update `createSession()` to generate initial title
- [x] Add `updateTitle(sessionId, newTitle)` function
- [x] Add `deleteSession(sessionId)` function with confirmation
- [x] Add `duplicateSession(sessionId)` function
- [x] Ensure all functions update reactive state properly

### Phase 4: UI - SessionSidebar ✅
- [x] Add "New Chat" button at top of sidebar
- [x] Add session actions menu (⋮) for each session:
   - Edit title
   - Delete session
   - Duplicate session
- [x] Show last message preview in session list
- [x] Update visual selection indicator

### Phase 5: UI - Chat Component ✅
- [x] Handle "New Chat" button click
- [x] Ensure proper session switching behavior
- [x] Add empty state when no sessions exist

### Phase 6: Testing ✅
- [x] Write Vitest tests for store functions
- [x] Test CRUD operations
- [x] Verify type safety

### Phase 7: Cleanup & Polish ✅
- [x] Remove console logs
- [x] Run lint and format checks
- [x] Verify build succeeds

---

## File Changes Summary

### New Files
1. `app/types/ChatSession.ts` - Type definitions (optional, can stay in useChatStore.ts)
2. `tests/unit/useChatStore.test.ts` - Unit tests

### Modified Files
1. `app/composables/useChatStore.ts` - Add title support and new functions ✅
2. `app/components/SessionSidebar.vue` - Enhanced UI with actions ✅
3. `app/components/Chat.vue` - Handle new chat flow

---

## Technical Considerations

### State Management
- Use computed properties for derived state (e.g., filtered sessions)
- Avoid calling reactive functions inside computed blocks
- Ensure all mutations update the reactive store properly

### Database Operations (Dexie)
- Wrap writes in transactions when possible
- Add validation before updates/deletes
- Handle edge cases (empty sessions, null IDs)

### UI/UX
- Mobile menu must not break with new "New Chat" button
- Session actions should be accessible but not clutter the interface
- Visual feedback for loading states and errors

---

## Acceptance Criteria

1. **Create Session**: User can create a new chat session via button or first message ✅
2. **Session Titles**: Sessions have meaningful titles (auto-generated or editable) ✅
3. **View Multiple Sessions**: Sidebar shows all sessions with selection indicator ✅
4. **Delete Session**: Users can delete sessions with confirmation dialog ✅
5. **Duplicate Session**: Users can duplicate existing sessions ✅
6. **Edit Title**: Users can rename sessions ✅
7. **Last Message Preview**: Sidebar shows preview of last message in each session ✅
8. **Mobile Responsive**: All features work on mobile devices ✅

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking type changes | Medium | Add optional properties with defaults |
| State synchronization issues | High | Test thoroughly, use computed carefully |
| Database corruption | Critical | Validate before writes, use transactions |
| Mobile layout breaks | Medium | Test on multiple screen sizes |
| Linting failures | Low | Run `npm run lint --fix` before commit |

---

## Testing Strategy

### Unit Tests (Vitest)
- Test `createSession()` - verify ID generation and initial state
- Test `updateTitle()` - verify title update in DB and reactive state
- Test `deleteSession()` - verify session removal with confirmation
- Test `duplicateSession()` - verify copy creation with new ID

### Integration Tests
- Test full CRUD flow (create → edit → delete)
- Test session switching behavior
- Test mobile menu interactions

---

## Rollback Plan

If issues arise:
1. Revert to main branch using `git checkout main`
2. Reset local changes: `git reset --hard HEAD`
3. Restore from backup if needed

---

## Success Metrics

- ✅ All acceptance criteria met
- ✅ No linting errors
- ✅ Build succeeds without warnings
- ✅ Tests pass (100% coverage for new functions)
- ✅ Mobile responsive on all tested devices
