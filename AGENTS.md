# Agent Guidelines for ai-chat Repository

## Overview
This document provides the conventions and tooling instructions that all agentic developers should follow when working in this repository. It covers build, linting, testing, code style, import order, naming conventions, error handling patterns, and any special rules defined by Cursor or Copilot.

---

## 1. Build / Lint / Test Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Nuxt development server (SSR disabled). |
| `npm run build` | Compile the production bundle for deployment. |
| `npm run preview` | Preview the built application locally. |
| `npm run lint` | Run ESLint with TypeScript support and auto‑fix where possible. |
| `npm run format` | Format all source files using Prettier (configured via `.prettierrc`). |
| `npm test` | Run the full Vitest test suite. |
| `npm test -- <file>` | Run a single test file or pattern. Example: `npm test -- tests/unit/example.test.ts`. |
| `npm run typecheck` | Execute TypeScript compiler in strict mode to surface type errors without emitting output. |

### Running a Single Test
Vitest supports the `--runTestsByPath` flag. The repository ships a convenient script:
```bash
# Run only tests matching the provided glob or file path
npm test -- <path-or-glob>
```
Example:
```bash
npm test -- tests/unit/chatStore.test.ts
```
This will run just that file, speeding up feedback loops.

---

## 2. Code Style Guidelines

### General Formatting
- **Prettier** is the single source of truth for formatting. Run `npm run format` before committing.
- Indentation: 2 spaces (configured in `.prettierrc`).
- Line length: 120 characters maximum; wrap long lines with back‑ticks or parentheses.
- Trailing commas are required in multiline objects/arrays.

### ESLint Rules
The repository uses the following core rules:
- `@typescript-eslint/no-explicit-any`: **off** – use `any` only when interfacing with external APIs that lack types.
- `@typescript-eslint/explicit-module-boundary-types`: **on** – all exported functions and components must declare return types.
- `no-console`: **warn** – console statements are allowed during development but should be removed before PR merge.
- `import/order`: Enforce a strict import order:
  1. Built‑in Node modules
  2. External packages (alphabetical)
  3. Internal aliases (`@/` and `~/*`)
  4. Relative imports

### Import Aliases
The project uses the following path aliases defined in `tsconfig.json`:
- `@/*` → `<root>/app`
- `~/assets/*` → `<root>/public/assets`
Always use these aliases for consistency.

### Naming Conventions
| Element | Convention |
|---------|------------|
| Variables / constants | `camelCase` |
| Types / interfaces | `PascalCase` |
| Enums | `PascalCase` with members in `SCREAMING_SNAKE_CASE` |
| React/Vue components | `PascalCase` (e.g., `ChatBox.vue`) |
| Vue composables | `useXxx` prefix (e.g., `useChatStore.ts`) |
| Files | `kebab-case` with `.ts`, `.vue`, or `.md` extensions |

### Error Handling
- Prefer **structured error objects** over plain strings. Example:
  ```ts
  interface ApiError {
    code: string;
    message: string;
    details?: unknown;
  }
  ```
- Use `try/catch` around async operations that may throw.
- For non‑critical failures, log the error and return a fallback value.
- Do **not** swallow errors silently; always surface them to the caller or UI.

### Types & Interfaces
- All public APIs must expose explicit types. Avoid `any` unless absolutely necessary.
- Use discriminated unions for state that can be in multiple shapes (e.g., loading, success, error).
- Keep interfaces in a dedicated `types/` folder under `app` when they are reused across modules.

### Vue Specifics
- Components should use the `<script setup lang="ts">` syntax.
- Props must have explicit types and default values where appropriate.
- Emit events with typed payloads using `defineEmits<...>()`.
- Slots: define `SlotProps` interfaces for complex slot data.

---

## 3. Cursor Rules (if any)
The repository contains a `.cursor/rules/` directory. Each rule file is a JSON schema that enforces patterns such as:
- No unused imports (`unused-imports`).
- Enforce consistent export style (`export-default`, `named-export`).
- Ensure all API routes have proper error handling.

If you add new rules, place them under `.cursor/rules/` and reference them in the `cursor.json` configuration.

---

## 4. Copilot Instructions (if any)
The `.github/copilot-instructions.md` file provides guidance for GitHub Copilot to generate code that aligns with repository conventions. Key points include:
- Prefer `defineComponent` over `Vue.extend`.
- Use `async/await` instead of callbacks.
- Avoid magic numbers; use named constants.

If you modify the Copilot instructions, ensure they are kept in sync with the style guide above.

---

## 5. Commit & Pull Request Practices
- Follow the Conventional Commits format (e.g., `feat: add chat store`).
- Include a brief description and reference any related issue numbers.
- Run all tests locally before pushing (`npm test`).
- Ensure linting passes (`npm run lint --fix`).
- Use GitHub Actions to enforce CI checks on every PR.

---

## 6. Additional Resources
- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Vitest Docs](https://vitest.dev/guide/)
- [ESLint TypeScript Plugin](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin)
- [Prettier Config](https://prettier.io/docs/en/configuration.html)

---

*This file is maintained by the core team. If you have suggestions, open an issue or PR.*
