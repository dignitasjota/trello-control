import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { logTaskChanges, logTaskActivity } from '@/lib/activity';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  const subtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY position ASC').all(id);
  return NextResponse.json({ ...task, subtasks });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const fields = ['title', 'description', 'status', 'priority', 'assignee', 'project', 'due_date', 'tags', 'estimate', 'position', 'archived'];
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const field of fields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(body[field]);
    }
  }

  // Auto-set completed_at when moving to terminado
  if (body.status === 'terminado' && existing.status !== 'terminado') {
    updates.push("completed_at = datetime('now', 'localtime')");
  } else if (body.status && body.status !== 'terminado') {
    updates.push('completed_at = NULL');
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(id);
  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  // Log changes
  logTaskChanges(id, existing, body);

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  logTaskActivity(id, 'deleted', 'status', (task as any).status, 'deleted');

  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
