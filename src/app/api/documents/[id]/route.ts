import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const existing = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const fields: string[] = [];
  const values: (string | number)[] = [];

  for (const key of ['title', 'content', 'category', 'project']) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(body[key]);
    }
  }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now', 'localtime')");
    values.push(id);
    db.prepare(`UPDATE documents SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
  return NextResponse.json(doc);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = db.prepare('DELETE FROM documents WHERE id = ?').run(id);
  if (result.changes === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
