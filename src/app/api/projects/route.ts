import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { Project, Task } from '@/lib/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function computeStats(project: Project) {
  const tasks = db.prepare('SELECT * FROM tasks WHERE project = ?').all(project.slug) as Task[];
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'terminado').length;
  const pending = tasks.filter(t => t.status === 'pendiente').length;
  const inProgress = tasks.filter(t => t.status === 'en_progreso').length;
  const review = tasks.filter(t => t.status === 'revision').length;

  // Last activity: most recent created_at or completed_at across all tasks
  let lastActivity: string | null = null;
  for (const t of tasks) {
    const dates = [t.created_at, t.completed_at].filter(Boolean) as string[];
    for (const d of dates) {
      if (!lastActivity || d > lastActivity) lastActivity = d;
    }
  }
  // Also consider project's own updated_at
  if (!lastActivity || project.updated_at > lastActivity) {
    lastActivity = project.updated_at;
  }

  let daysInactive = 0;
  if (lastActivity) {
    const diff = Date.now() - new Date(lastActivity).getTime();
    daysInactive = Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  return {
    ...project,
    total_tasks: total,
    completed_tasks: completed,
    pending_tasks: pending,
    in_progress_tasks: inProgress,
    review_tasks: review,
    last_activity: lastActivity,
    days_inactive: daysInactive,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get('archived') === 'true';

  let query = 'SELECT * FROM projects';
  if (!includeArchived) {
    query += ' WHERE archived = 0';
  }
  query += ' ORDER BY updated_at DESC';

  const projects = db.prepare(query).all() as Project[];
  const withStats = projects.map(computeStats);

  return NextResponse.json(withStats);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description = '', color = '#3b82f6', icon = 'folder' } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const slug = slugify(name);
  const existing = db.prepare('SELECT id FROM projects WHERE slug = ?').get(slug);
  if (existing) {
    return NextResponse.json({ error: 'A project with this name already exists' }, { status: 409 });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO projects (id, slug, name, description, color, icon)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, slug, name, description, color, icon);

  const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project;
  return NextResponse.json(computeStats(created), { status: 201 });
}
