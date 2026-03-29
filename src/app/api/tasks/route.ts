import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { Status } from '@/lib/types';
import { logTaskActivity } from '@/lib/activity';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as Status | null;
  const project = searchParams.get('project');
  const priority = searchParams.get('priority');
  const assignee = searchParams.get('assignee');
  const includeSubtasks = searchParams.get('include_subtasks');
  const archived = searchParams.get('archived') === 'true' ? 1 : 0;

  let query = 'SELECT * FROM tasks';
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  conditions.push('archived = ?');
  params.push(archived);

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (project) {
    conditions.push('project = ?');
    params.push(project);
  }
  if (priority) {
    conditions.push('priority = ?');
    params.push(priority);
  }
  if (assignee) {
    conditions.push('assignee = ?');
    params.push(assignee);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY position ASC, created_at DESC';

  const tasks = db.prepare(query).all(...params) as Record<string, unknown>[];

  if (includeSubtasks) {
    const subtaskStmt = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY position ASC');
    const result = tasks.map(t => ({
      ...t,
      subtasks: subtaskStmt.all(t.id as string),
    }));
    return NextResponse.json(result);
  }

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description = '', status = 'pendiente', priority = 'media', assignee = '', project = '', due_date = null, tags = '', estimate = null } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const id = uuidv4();
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), -1) as max FROM tasks WHERE status = ?').get(status) as { max: number };

  db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, assignee, project, due_date, tags, estimate, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, description, status, priority, assignee, project, due_date, tags, estimate, maxPos.max + 1);

  logTaskActivity(id, 'created', 'title', '', title);

  const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return NextResponse.json(created, { status: 201 });
}
