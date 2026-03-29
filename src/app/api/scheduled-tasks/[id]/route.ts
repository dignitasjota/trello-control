import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(id);
  if (!task) {
    return NextResponse.json({ error: 'Scheduled task not found' }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const existing = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(id);
  if (!existing) {
    return NextResponse.json({ error: 'Scheduled task not found' }, { status: 404 });
  }

  const fields = ['name', 'description', 'frequency', 'cron_expression', 'scheduled_time', 'active'];
  const updates: string[] = ["updated_at = datetime('now', 'localtime')"];
  const values: unknown[] = [];

  for (const field of fields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(field === 'active' ? (body[field] ? 1 : 0) : body[field]);
    }
  }

  if (values.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(id);
  db.prepare(`UPDATE scheduled_tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(id);
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = db.prepare('DELETE FROM scheduled_tasks WHERE id = ?').run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: 'Scheduled task not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
