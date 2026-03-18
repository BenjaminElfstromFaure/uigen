# UIGen — Claude Code Guide

AI-powered React component generator. Users describe a component in chat, Claude generates it using tool calls against a virtual file system, and the result renders in a live browser preview.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run dev:daemon   # Start dev server in background, logs → logs.txt
npm test             # Run Vitest test suite
npm run build        # Production build
npm run db:reset     # Drop and recreate the database (destructive)
```

## Architecture

### Request flow

1. User types in `ChatInterface` → `useChat` (Vercel AI SDK) POSTs to `/api/chat`
2. `/api/chat/route.ts` reconstructs the `VirtualFileSystem` from serialized state sent by the client
3. `streamText` runs Claude (`claude-haiku-4-5`) with two tools: `str_replace_editor` and `file_manager`
4. Claude calls tools to create/edit files in the virtual FS; tool results stream back to the client
5. On finish, if the user is authenticated and a `projectId` is present, the updated FS and messages are persisted to SQLite via Prisma
6. `PreviewFrame` renders the virtual FS files in-browser using a Babel JSX transform

### Virtual file system (`src/lib/file-system.ts`)

`VirtualFileSystem` is an in-memory tree of `FileNode` objects — no files are ever written to disk. It is serialized to a plain `Record<string, FileNode>` for transport (client → API route) and persistence (SQLite `Project.data` column).

Key methods: `createFile`, `updateFile`, `deleteFile`, `rename`, `readFile`, `serialize`, `deserializeFromNodes`.

### AI tools

| Tool | File | Purpose |
|------|------|---------|
| `str_replace_editor` | `src/lib/tools/str-replace.ts` | `view`, `create`, `str_replace`, `insert` on VFS files |
| `file_manager` | `src/lib/tools/file-manager.ts` | `rename` and `delete` on VFS nodes |

Both tools are constructed with a reference to the request-scoped `VirtualFileSystem` instance.

### System prompt

`src/lib/prompts/generation.tsx` — instructs Claude to:
- Always create `/App.jsx` as the entry point
- Use Tailwind CSS for styling (no hardcoded styles)
- Use `@/` import alias for non-library files
- Keep responses brief

### Provider / mock mode

`src/lib/provider.ts` — `getLanguageModel()` returns:
- **Real:** `anthropic("claude-haiku-4-5")` when `ANTHROPIC_API_KEY` is set
- **Mock:** `MockLanguageModel` when no API key is present — generates static counter/form/card components deterministically, useful for development without an API key

### Auth

`src/lib/auth.ts` — JWT-based sessions via `jose`, stored in an `httpOnly` cookie (`auth-token`, 7-day expiry). The JWT secret defaults to `"development-secret-key"` when `JWT_SECRET` env var is not set. Auth is **optional** — anonymous users can use the app, but projects are only persisted for authenticated users.

### Database

The database schema is defined in `prisma/schema.prisma` — always reference it for the authoritative structure of data stored in the database.

SQLite at `prisma/dev.db`.

`Project.messages` — full Vercel AI SDK message history (JSON)
`Project.data` — serialized `VirtualFileSystem` (JSON)

### Context providers

| Context | File | Provides |
|---------|------|---------|
| `FileSystemContext` | `src/lib/contexts/file-system-context.tsx` | VFS state, active file selection |
| `ChatContext` | `src/lib/contexts/chat-context.tsx` | Chat messages, send handler |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | No | Enables real Claude generation. App runs in mock mode without it. |
| `JWT_SECRET` | No | JWT signing secret. Defaults to an insecure dev value — set in production. |

Copy `.env` and fill in values as needed. The file is gitignored.

## Testing

Tests use **Vitest** + **@testing-library/react** with jsdom.

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
```

Test files live alongside source under `__tests__/` subdirectories:
- `src/components/chat/__tests__/`
- `src/components/editor/__tests__/`
- `src/lib/__tests__/`
- `src/lib/contexts/__tests__/`
- `src/lib/transform/__tests__/`

## Key conventions

- **Imports:** Use `@/` alias for internal imports (configured in `tsconfig.json`)
- **Components:** shadcn/ui primitives in `src/components/ui/`, built on Radix UI
- **Styling:** Tailwind CSS v4 — no hardcoded styles
- **Server-only code:** Mark with `import "server-only"` (e.g. `src/lib/auth.ts`, `src/lib/prisma.ts`)
- **Server actions:** Live in `src/actions/`, imported from `src/actions/index.ts`
- **Generated code:** Prisma client outputs to `src/generated/prisma/` — do not edit manually
