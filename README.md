# Centro de Control — Kanban Board

Personal task management dashboard with Kanban board, dark mode, and REST API.

## Quick Start

### Local Development
```bash
npm install
npm run dev
```
Visit `http://localhost:3001`

### Docker (recommended for VPS)
```bash
docker-compose up -d
```
Visit `http://localhost:3000`

## Features

- 📊 **Kanban Board** — 4 columns: Pendientes, En Progreso, Revisión, Terminado
- 🖱️ **Drag & Drop** — Reorder and move tasks between columns
- 🏷️ **Task Tags** — Priority (alta/media/baja), Project, Assignee
- 📅 **Auto Dates** — Creation date + completion date when marked done
- 🎯 **Revision Highlight** — Tasks in "Revisión" have visual accent
- 🌙 **Dark Mode** — Minimalist dark interface
- 🔌 **REST API** — Full CRUD via `/api/tasks`

## API Endpoints

```
GET    /api/tasks                 # List all tasks (supports ?status=, ?project=, ?priority=)
POST   /api/tasks                 # Create task
GET    /api/tasks/:id             # Get single task
PATCH  /api/tasks/:id             # Update task
DELETE /api/tasks/:id             # Delete task
```

## Data Persistence

- **Local**: SQLite DB stored at `kanban.db` (auto-created)
- **Docker**: Persists in named volume `kanban_kanban_data`

## VPS Deployment

1. Clone to VPS
2. Run `docker-compose up -d`
3. (Optional) Add nginx reverse proxy for port 80/443

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS v4
- **Drag & Drop**: @dnd-kit
- **Database**: SQLite (better-sqlite3)
- **Runtime**: Node.js 22 (Alpine)
- **UI Language**: Spanish

## Development

See `CLAUDE.md` for detailed development notes.
