# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Quick Reference

**Centro de Control** — Personal dashboard with Kanban board, calendar, projects, memories, and documents. Built with Next.js 16 (App Router), SQLite (better-sqlite3), and Tailwind CSS v4. Features dark/light theme, full API auth, export/import, activity logging, and complete settings management.

- **Stack**: Next.js 16, React 19, TypeScript, Tailwind v4, SQLite (better-sqlite3), @dnd-kit, react-markdown
- **Language**: Spanish UI
- **Database**: SQLite with WAL mode, foreign keys enabled
- **API**: REST JSON, optional Bearer token auth, middleware-based security
- **Deployment**: Docker multi-stage build, volume mount for DB persistence

---

## Commands

### Local development
- `npm run dev` — Start dev server (Turbopack, port 3001)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — ESLint

### Docker
- `docker-compose up -d` — Start app in background (http://localhost:3000)
- `docker-compose down` — Stop and remove containers
- `docker-compose logs -f` — Tail logs
- `docker build -t kanban:latest .` — Build image manually

### Environment Variables
- `NODE_ENV` — `production` (Docker) or `development` (local)
- `DB_PATH` — Path to SQLite DB (default: `kanban.db` local, `/data/kanban.db` Docker)
- `API_TOKEN` — Optional Bearer token for API auth. If set, all `/api/*` routes require `Authorization: Bearer <token>` header (except browser same-origin requests)

---

## Architecture Overview

### Pages
- `/` — Dashboard: stats cards, overdue/due-soon alerts, review queue, scheduled tasks, active projects with progress
- `/kanban` — Kanban board: 4 columns (pendiente, en_progreso, revision, terminado), drag-and-drop, filters (search, priority, assignee, project, tag), export/import buttons
- `/calendario` — Calendar: month/week views for scheduled tasks, execution tracking, manual scheduling
- `/proyectos` — Project grid with progress bars, status indicators, archive/restore
- `/proyectos/[slug]` — Project detail: tasks by column, linked documents, activity timeline
- `/memorias` — Memories timeline (daily) + long-term wiki docs (Flujos, Objetivos, Perfil, Reglas)
- `/documentos` — Document grid/list with markdown editor, full-text search, categories, project association
- `/configuracion` — Settings: profile, theme, notifications, defaults, data backup/export, API reference

### Database Schema

**Tables** (all with timestamps, SQLite):
- `tasks` — id, title, description, status, priority, assignee, project, due_date, tags, estimate, position, archived, created_at, completed_at
- `subtasks` — id, task_id, title, completed, position, created_at
- `task_activity` — id, task_id, action (created|updated|status_changed|deleted), field, old_value, new_value, created_at
- `scheduled_tasks` — id, name, description, frequency, cron_expression, scheduled_time, active, created_at, updated_at
- `scheduled_executions` — id, task_id, executed_at, notes
- `projects` — id, slug, name, description, color, icon, archived, created_at, updated_at
- `project_documents` — id, project_id, name, url, notes, created_at
- `memories` — id, title, content, category, project, created_at, updated_at
- `long_term_docs` — id, slug, title, content, updated_at
- `documents` — id, title, content, category, project, created_at, updated_at
- `document_categories` — id, name, color
- `settings` — key (PRIMARY KEY), value

**Seeded defaults**:
- Document categories: planificacion, arquitectura, prd, newsletter, contenido, otro
- Long-term docs: Flujos de Trabajo, Objetivos, Perfil, Reglas del Agente
- Settings: user_name, user_role, notifications_enabled, notifications_interval, default_priority, default_assignee

### API Endpoints

**Tasks** (`/api/tasks/[id]/...`):
- `GET /api/tasks` — List tasks (filters: `?status=`, `?project=`, `?priority=`, `?assignee=`, `?include_subtasks=1`, `?archived=true`)
- `POST /api/tasks` — Create task
- `GET /api/tasks/[id]` — Get task with subtasks
- `PATCH /api/tasks/[id]` — Update task (auto-sets `completed_at` when status=`terminado`)
- `DELETE /api/tasks/[id]` — Delete task (logs activity)
- `PATCH /api/tasks/[id]/move` — Explicit column move
- `GET/POST/PATCH/DELETE /api/tasks/[id]/subtasks` — Subtask CRUD
- `GET /api/tasks/[id]/activity` — Task activity timeline (DESC by timestamp)
- `GET /api/tasks/archived?project=slug` — List archived tasks
- `GET /api/tasks/export?format=json|csv&project=slug&archived=false` — Export tasks
- `POST /api/tasks/import` — Bulk import from JSON array

**Scheduled Tasks** (`/api/scheduled-tasks/[id]/...`):
- `GET/POST /api/scheduled-tasks` — List all / create
- `GET/PATCH/DELETE /api/scheduled-tasks/[id]` — Read / update / delete
- `POST /api/scheduled-tasks/[id]/execute` — Mark executed (records timestamp)
- `GET /api/scheduled-tasks/[id]/executions?date=YYYY-MM-DD` — List executions
- `GET /api/scheduled-tasks/today` — Today's tasks with `executed_today` boolean

**Projects** (`/api/projects/[slug]/...`):
- `GET /api/projects?archived=true` — List projects with stats
- `POST /api/projects` — Create (auto-generates slug)
- `GET /api/projects/[slug]` — Project detail with tasks and documents
- `PATCH /api/projects/[slug]` — Update project
- `POST /api/projects/[slug]/documents` — Add document to project
- `GET /api/projects/[slug]/activity?limit=50` — Project activity timeline

**Memories** (`/api/memories/[id]/...`):
- `GET/POST /api/memories` — List (filters: `?category=`, `?project=`, `?from=`, `?to=`) / create
- `GET/PATCH/DELETE /api/memories/[id]` — Read / update / delete
- `GET /api/memories/search?q=text` — Full-text search
- `GET /api/memories/context?project=slug` — Agent context: recent memories + long-term docs
- `GET/PATCH /api/long-term-docs/[slug]` — Wiki doc CRUD

**Documents** (`/api/documents/[id]/...`):
- `GET/POST /api/documents` — List (filters: `?category=`, `?project=`, `?sort=updated_at|created_at`) / create
- `GET/PATCH/DELETE /api/documents/[id]` — Read / update / delete
- `GET /api/documents/search?q=text` — Full-text search
- `GET/POST /api/document-categories` — Categories CRUD

**Agent API**:
- `GET /api/agent-tasks?status=pendiente` — Tasks for agent (assigned to `agente`)
- `GET /api/notifications` — Computed notifications (no separate table): overdue, due_soon, review, scheduled
- `GET /api/settings` — Current settings + API token status
- `PATCH /api/settings` — Update settings
- `GET /api/backup` — Full backup of all tables (JSON)

**Authentication**:
- Optional Bearer token via `API_TOKEN` env var (middleware at `src/middleware.ts`)
- Header format: `Authorization: Bearer <token>`
- Browser same-origin requests pass without token via `sec-fetch-site` header check
- When `API_TOKEN` not set, auth is disabled (local dev default)

### Key Conventions

**Task Model**:
- Statuses: `pendiente`, `en_progreso`, `revision`, `terminado`
- Auto-fields: `completed_at` set when moving to `terminado`, cleared when moving out
- `revision` column: amber highlight/glow for visual emphasis
- `due_date` (ISO string): color-coded on card (red=overdue, amber=within 2 days)
- `tags` (comma-separated): shown as colored badges, filterable via dropdown
- `estimate` (fibonacci: 1,2,3,5,8,13): shown on card, summed in column headers
- `archived` (0/1): soft-delete, restored via UI toast undo

**Subtasks** (checklist):
- Shown as progress bar on TaskCard (completed/total)
- Editable in TaskModal
- Each has `position` for ordering

**Activity Log**:
- Auto-logged on task creation, update, status change, delete
- Tracks field-level changes (old_value, new_value)
- Accessed via TaskModal timeline toggle

**Dashboard**:
- Computed stats: total tasks, completed today, overdue
- Alerts: overdue tasks (red), due soon (amber), in review (blue)
- Scheduled today with execution status
- Active projects sorted by last activity

**Filters** (Kanban board):
- Client-side: search, priority, assignee, project, tag
- Tag dropdown auto-populated from existing task tags
- Clear button resets all filters

**Colors & Theme**:
- Dark mode (default): zinc color scale (#09090b bg, #fafafa text)
- Light mode: inverted zinc scale via CSS custom properties (no component changes)
- Theme toggle: sun/moon icon in NavHeader, persisted in localStorage
- Anti-flash script prevents FOUC
- Accent colors: 6 selectable colors in settings

**Markdown**:
- `react-markdown` + `remark-gfm` for rendering in memories, documents, long-term docs
- `MarkdownEditor` component: toolbar (bold, italic, code, heading, list, checklist, link, code block) + preview toggle
- Cursor position preserved after toolbar actions via `requestAnimationFrame`

**Notifications**:
- `NotificationBell` component: polling every 60s (configurable in settings)
- Computed from task data: overdue, due_soon (≤2 days), in review column, scheduled for today
- No separate table — derived on each GET

**Keyboard Shortcuts**:
- `?` — Help modal
- `1-6` — Navigate pages (Inicio, Kanban, Calendario, Proyectos, Memorias, Documentos)
- `/` — Focus search bar
- `Esc` — Close modal/modal

**Toast/Notifications**:
- `ToastProvider` context wraps layout
- `useToast().showToast(msg, onUndo?)` shows 5s auto-dismiss toast
- "Deshacer" button on delete, archive actions
- Auto-remove after 5s or manual dismiss

**Settings** (key-value store):
- `user_name`, `user_role` — Profile info
- `notifications_enabled`, `notifications_interval` — Notification preferences
- `default_priority`, `default_assignee` — Task defaults
- API token status read from `API_TOKEN` env var

---

## Component Patterns

### Key Components
- **ThemeProvider** — Context for dark/light mode, handles localStorage persistence and anti-flash
- **ToastProvider** — Context for toast notifications with optional undo callbacks
- **Board** — Main Kanban with @dnd-kit drag-and-drop, filters, export/import buttons
- **TaskModal** — Create/edit tasks with full metadata, subtasks, activity timeline
- **TaskCard** — Display task (priority, estimate, tags, due_date, subtasks progress, assignee)
- **Column** — Droppable column with task list and story points total
- **MarkdownEditor** — Reusable toolbar + preview toggle for markdown input
- **ActivityTimeline** — Timeline display for task/project changes
- **NotificationBell** — Bell with badge + dropdown panel, 60s polling
- **ExportImport** — Buttons for JSON/CSV export and file import
- **SettingsView** — Profile, theme, notifications, defaults, backup/export/import, API info
- **Dashboard** — Stats, alerts, scheduled tasks, project overview

### Patterns
- Client-side filtering (search, filters applied in React, not API)
- Optimistic UI updates (update state before fetch confirmation)
- Auto-save on blur (settings, some inputs)
- Drag-and-drop position tracking (position field updated in DB)
- Soft-delete pattern (archived field, not true deletion)
- Undo via toast callback (re-create/restore on demand)

---

## Deployment

### Docker
- **Image**: Node 22 Alpine, multi-stage build (~200MB)
- **Build**: `npm ci`, `npm run build`
- **Health check**: `wget` every 30s
- **Data volume**: `./data:/data` (SQLite at `/data/kanban.db`)
- **Port**: 3000
- **Restart**: unless-stopped

### Configuration for Production
```yaml
# docker-compose.yml
environment:
  NODE_ENV: production
  DB_PATH: /data/kanban.db
  API_TOKEN: your-secret-token-here  # Optional
```

### VPS Deployment
1. Clone repo
2. `docker-compose up -d` (creates `/data` dir and DB on first run)
3. (Optional) Nginx reverse proxy for port 80/443
4. Backup: copy `./data/kanban.db` to safe location

### Scaling
- SQLite suitable for single-user/small team use
- For multiple concurrent users → PostgreSQL + separate API service
- Current architecture allows splitting frontend and API into separate Docker images

---

## Development Notes

### Adding New Features

Follow the pattern in `memory/feature_patterns.md`:
1. **Database**: Add table or column to `src/lib/db.ts` (with migration block if adding to existing table)
2. **Types**: Update `src/lib/types.ts` with new interfaces
3. **API**: Create route handler(s) in `src/app/api/...`
4. **Component**: Build UI component in `src/components/...`
5. **Page**: Create or update page in `src/app/...` if needed
6. **Nav**: Link in `src/components/NavHeader.tsx` if adding new route
7. **Docs**: Update CLAUDE.md with new conventions/endpoints

### Important Conventions
- **No literal `white`/`black`**: Use `zinc-50`/`zinc-900` instead for theme compatibility
- **Migrations**: Use try-catch blocks for ALTER TABLE (column may already exist)
- **Activity logging**: Call `logTaskActivity()` or `logTaskChanges()` after task updates
- **Settings updates**: Use PATCH to `/api/settings` with whitelisted keys only
- **Async params**: Next.js 16 pattern is `params: Promise<{id: string}>` with `await`
- **Toast undo**: Pass async callback to `showToast(msg, asyncFn)` for reversible actions

### Testing API Locally
```bash
# Without auth (API_TOKEN not set)
curl http://localhost:3000/api/projects

# With auth (API_TOKEN=secret-token)
curl -H "Authorization: Bearer secret-token" http://localhost:3000/api/projects

# Export
curl http://localhost:3000/api/tasks/export?format=json > tasks.json
curl http://localhost:3000/api/backup > full-backup.json

# Import
curl -X POST http://localhost:3000/api/tasks/import \
  -H 'Content-Type: application/json' \
  -d @tasks.json
```

### Debugging
- **Logs**: `docker-compose logs -f kanban-app` for container output
- **Database**: SQLite file at `./data/kanban.db` (local) — can inspect with `sqlite3` CLI
- **Network**: All API calls logged in browser DevTools Network tab
- **Performance**: Disable activity logging temporarily if doing bulk imports (lots of INSERTs)

---

## File Structure (Key)
```
src/
  app/
    api/
      tasks/ — Task endpoints (GET, POST, PATCH, DELETE, import, export, archived, activity)
      scheduled-tasks/ — Scheduled task CRUD
      projects/ — Project endpoints (with activity, documents)
      memories/ — Memory and long-term doc endpoints
      documents/ — Document CRUD
      notifications/ — Computed notifications
      settings/ — Settings CRUD
      backup/ — Full backup export
    (pages) — Route handlers for pages
    layout.tsx — Root layout with ThemeProvider, ToastProvider
    globals.css — Theme colors, animations
  components/
    Board.tsx — Kanban main component
    Column.tsx — Droppable column
    TaskCard.tsx — Task display
    TaskModal.tsx — Create/edit modal
    NavHeader.tsx — Navigation with theme/settings toggles
    Dashboard.tsx — Dashboard summary
    ThemeProvider.tsx — Theme context
    ToastProvider.tsx — Toast context
    MarkdownEditor.tsx — Toolbar + preview
    ActivityTimeline.tsx — Activity log display
    NotificationBell.tsx — Notification bell with polling
    SettingsView.tsx — Settings page content
    ExportImport.tsx — Export/import buttons
    (other feature components)
  lib/
    db.ts — Database initialization, migrations
    types.ts — All TypeScript interfaces
    activity.ts — Activity logging utilities
    schedule-utils.ts — Cron and date utilities
```

---

## Recent Improvements (All 20 Implemented)

1. **Project Selector** — Dropdown in task creation, views projects with progress
2. **Due Dates** — ISO date field, color-coded on cards (red=overdue, amber=urgent)
3. **Dashboard** — Summary page with stats, alerts, scheduled tasks, projects
4. **Kanban Filters** — Search, priority, assignee, project, tag dropdown
5. **Subtasks/Checklist** — Progress bar on cards, editable in modal
6. **Markdown Editor** — Reusable toolbar (bold, italic, code, heading, list, link, code block) + preview
7. **Markdown Preview** — Toggle in editor, auto-rendered with react-markdown
8. **Keyboard Shortcuts** — Global: `?` help, `1-6` nav, `/` search, `Esc` close
9. **Notifications** — Bell icon with badge, 60s polling, dropdown panel
10. **Tags/Labels** — Comma-separated TEXT field, colored badges, filter dropdown
11. **Story Points** — Fibonacci values (1,2,3,5,8,13), badge on card, summed in column headers
12. **Undo/Redo** — Toast with "Deshacer" button, 5s auto-dismiss, used on delete/archive
13. **Notifications/Reminders** — Computed (no separate table): overdue, due_soon, in_review, scheduled
14. **Activity/Historial** — `task_activity` table with field-level diffs, auto-logged, timeline UI in modal
15. **Archiving** — Soft-delete via `archived` field, filtered out by default, restore via UI
16. **Export/Import** — JSON/CSV export (tasks), bulk import from JSON, logs activity for imported tasks
17. **API Auth** — Optional Bearer token via `API_TOKEN` env var, middleware-based, browser same-origin bypass
18. **Dark/Light Theme** — Toggle in NavHeader, CSS zinc scale inversion, persisted in localStorage, anti-flash script
19. **Settings/Preferences** — `/configuracion` page with profile, theme, notifications, defaults, backup/export, API reference
20. **Full Backup** — `GET /api/backup` exports all tables, downloadable from settings

---

## Notes

- The database is automatically created on first run
- All timestamps are in local time (SQLite `datetime('now', 'localtime')`)
- The app supports light/dark mode but uses dark by default (CSS variables flip when `data-theme=light`)
- Activity is auto-logged but can be disabled per-request if needed (see `src/lib/activity.ts`)
- API token auth is optional and backward-compatible (when not set, all requests pass)
- Future improvements could include: archiving for projects/memories, full-text search across all content, export to calendar formats, webhooks for external integrations
