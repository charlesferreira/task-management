# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 6173
npm run build      # Type-check + production build (tsc -b && vite build)
npm run lint       # Run ESLint
npm run preview    # Preview production build on port 6173
```

No test runner is configured.

## Architecture

**Task Organizer** is a client-side-only task management SPA. All data persists to `localStorage` — there is no backend.

### Views (pages/)

Three independent views sharing the same hooks:
- **BoardView** — Kanban board, projects as columns
- **ListView** — Flat global task list with filtering
- **ZenView** — Minimal time-tracking focus view

URL is the source of truth for active view and open task drawer:
```
/projects | /tasks | /tracker
/:view/task/:taskId   →  opens TaskDetailsDrawer
```

### State Management

No Redux/Zustand. State lives in two custom hooks:

- **`useTasks`** (`hooks/useTasks.ts`, ~600 LOC) — task CRUD, reordering, time tracking, undo snapshots
- **`useProjects`** (`hooks/useProjects.ts`) — project CRUD, ordering, unassigned project handling

Both hooks read from localStorage on init and write back on every mutation (synchronous).

**Undo pattern** — snapshot before action, offer toast with restore callback:
```typescript
const snapshot = getTasksSnapshot()
performAction()
showUndoToast(message, () => restoreTasksSnapshot(snapshot))
```

### Service Layer (services/)

Services own serialization and localStorage keys; hooks consume services and add React state:
- `taskService` → `localStorage['taskOrganizer.tasks']`
- `projectService` → `localStorage['taskOrganizer.projects']`
- `taskHistoryService` → completion history

### Drag-and-Drop

`TaskDndProvider` wraps dnd-kit context. Uses `@dnd-kit/sortable` for list reordering and `@dnd-kit/core` for cross-project movement in the board view.

### Key Constraints

- **TypeScript strict mode** with `noUnusedLocals` and `noUnusedParameters` — unused vars cause build failures.
- TailwindCSS v4 (not v3) — config is in `vite.config.ts`, not `tailwind.config.js`.
- Prettier with `prettier-plugin-tailwindcss` sorts Tailwind classes automatically.
