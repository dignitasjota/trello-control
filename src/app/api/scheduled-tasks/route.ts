import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const tasks = db.prepare('SELECT * FROM scheduled_tasks ORDER BY created_at DESC').all();
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    description = '',
    frequency = 'diaria',
    cron_expression = '',
    scheduled_time = '09:00',
    active = 1,
  } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO scheduled_tasks (id, name, description, frequency, cron_expression, scheduled_time, active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, description, frequency, cron_expression, scheduled_time, active ? 1 : 0);

  const created = db.prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(id);
  return NextResponse.json(created, { status: 201 });
}
