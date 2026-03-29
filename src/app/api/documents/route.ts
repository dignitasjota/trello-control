import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const project = searchParams.get('project');
  const sort = searchParams.get('sort') || 'updated_at';

  let query = 'SELECT * FROM documents WHERE 1=1';
  const params: string[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (project) {
    query += ' AND project = ?';
    params.push(project);
  }

  const sortCol = sort === 'created_at' ? 'created_at' : 'updated_at';
  query += ` ORDER BY ${sortCol} DESC`;

  const docs = db.prepare(query).all(...params);
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = randomUUID();
  const { title, content = '', category = 'otro', project = '' } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  db.prepare(
    'INSERT INTO documents (id, title, content, category, project) VALUES (?, ?, ?, ?, ?)'
  ).run(id, title, content, category, project);

  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
  return NextResponse.json(doc, { status: 201 });
}
