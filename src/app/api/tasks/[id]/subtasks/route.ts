import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY position ASC').all(id);
  return NextResponse.json(subtasks);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { title } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(id);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const subId = randomUUID();
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as max FROM subtasks WHERE task_id = ?').get(id) as { max: number };

  db.prepare('INSERT INTO subtasks (id, task_id, title, position) VALUES (?, ?, ?, ?)').run(subId, id, title, maxPos.max + 1);

  const created = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(subId);
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id: subId, completed, title } = body;

  if (!subId) {
    return NextResponse.json({ error: 'Subtask id required' }, { status: 400 });
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (completed !== undefined) {
    updates.push('completed = ?');
    values.push(completed ? 1 : 0);
  }
  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }

  if (updates.length > 0) {
    values.push(subId);
    db.prepare(`UPDATE subtasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  const updated = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(subId);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subId = searchParams.get('subId');

  if (!subId) {
    return NextResponse.json({ error: 'subId required' }, { status: 400 });
  }

  db.prepare('DELETE FROM subtasks WHERE id = ?').run(subId);
  return NextResponse.json({ ok: true });
}
