import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const project = searchParams.get('project');
  const from = searchParams.get('from'); // YYYY-MM-DD
  const to = searchParams.get('to');     // YYYY-MM-DD

  let query = 'SELECT * FROM memories';
  const conditions: string[] = [];
  const params: string[] = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (project) {
    conditions.push('project = ?');
    params.push(project);
  }
  if (from) {
    conditions.push('date(created_at) >= ?');
    params.push(from);
  }
  if (to) {
    conditions.push('date(created_at) <= ?');
    params.push(to);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  const memories = db.prepare(query).all(...params);
  return NextResponse.json(memories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content = '', category = 'nota', project = '' } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO memories (id, title, content, category, project)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, title, content, category, project);

  const created = db.prepare('SELECT * FROM memories WHERE id = ?').get(id);
  return NextResponse.json(created, { status: 201 });
}
