import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { logTaskActivity } from '@/lib/activity';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tasks = Array.isArray(body) ? body : body.tasks || [];

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'Invalid tasks array' }, { status: 400 });
    }

    const imported: string[] = [];

    for (const task of tasks) {
      const {
        title,
        description = '',
        status = 'pendiente',
        priority = 'media',
        assignee = '',
        project = '',
        due_date = null,
        tags = '',
        estimate = null,
      } = task;

      if (!title) continue;

      const id = uuidv4();
      const maxPos = db
        .prepare('SELECT COALESCE(MAX(position), -1) as max FROM tasks WHERE status = ?')
        .get(status) as { max: number };

      db.prepare(`
        INSERT INTO tasks (id, title, description, status, priority, assignee, project, due_date, tags, estimate, position)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, description, status, priority, assignee, project, due_date, tags, estimate, maxPos.max + 1);

      logTaskActivity(id, 'created', 'title', '', title);
      imported.push(id);
    }

    return NextResponse.json(
      { success: true, imported: imported.length, total: tasks.length, ids: imported },
      { status: 201 }
    );
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 400 });
  }
}
