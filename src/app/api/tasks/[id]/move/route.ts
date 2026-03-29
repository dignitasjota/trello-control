import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Status } from '@/lib/types';

const VALID_STATUSES: Status[] = ['pendiente', 'en_progreso', 'revision', 'terminado'];

// PATCH /api/tasks/:id/move — move a task to a new status column
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { status, position } = body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status. Must be one of: ' + VALID_STATUSES.join(', ') },
      { status: 400 }
    );
  }

  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const updates: string[] = ['status = ?'];
  const values: unknown[] = [status];

  // Auto-set completed_at
  if (status === 'terminado' && existing.status !== 'terminado') {
    updates.push("completed_at = datetime('now', 'localtime')");
  } else if (status !== 'terminado') {
    updates.push('completed_at = NULL');
  }

  if (position !== undefined) {
    updates.push('position = ?');
    values.push(position);
  } else {
    // Append to end of target column
    const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as max FROM tasks WHERE status = ?').get(status) as { max: number };
    updates.push('position = ?');
    values.push(maxPos.max + 1);
  }

  values.push(id);
  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return NextResponse.json(updated);
}
