import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Project, Task } from '@/lib/types';

function computeStats(project: Project) {
  const tasks = db.prepare('SELECT * FROM tasks WHERE project = ?').all(project.slug) as Task[];
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'terminado').length;
  const pending = tasks.filter(t => t.status === 'pendiente').length;
  const inProgress = tasks.filter(t => t.status === 'en_progreso').length;
  const review = tasks.filter(t => t.status === 'revision').length;

  let lastActivity: string | null = null;
  for (const t of tasks) {
    const dates = [t.created_at, t.completed_at].filter(Boolean) as string[];
    for (const d of dates) {
      if (!lastActivity || d > lastActivity) lastActivity = d;
    }
  }
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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as Project | undefined;
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const stats = computeStats(project);
  const tasks = db.prepare('SELECT * FROM tasks WHERE project = ? ORDER BY position ASC').all(slug);
  const documents = db.prepare('SELECT * FROM project_documents WHERE project_id = ? ORDER BY created_at DESC').all(project.id);

  return NextResponse.json({ ...stats, tasks, documents });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json();

  const existing = db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as Project | undefined;
  if (!existing) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const fields = ['name', 'description', 'color', 'icon', 'archived'];
  const updates: string[] = ["updated_at = datetime('now', 'localtime')"];
  const values: unknown[] = [];

  for (const field of fields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(field === 'archived' ? (body[field] ? 1 : 0) : body[field]);
    }
  }

  if (values.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(existing.id);
  db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(existing.id) as Project;
  return NextResponse.json(computeStats(updated));
}
