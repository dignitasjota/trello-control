import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// POST /api/scheduled-tasks/:id/execute — mark a scheduled task as executed
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const task = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(id);
  if (!task) {
    return NextResponse.json({ error: 'Scheduled task not found' }, { status: 404 });
  }

  const execId = uuidv4();
  const notes = body.notes || '';

  db.prepare(`
    INSERT INTO scheduled_executions (id, task_id, notes)
    VALUES (?, ?, ?)
  `).run(execId, id, notes);

  const execution = db.prepare('SELECT * FROM scheduled_executions WHERE id = ?').get(execId);
  return NextResponse.json(execution, { status: 201 });
}
