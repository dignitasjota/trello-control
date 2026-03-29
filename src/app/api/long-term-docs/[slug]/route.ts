import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = db.prepare('SELECT * FROM long_term_docs WHERE slug = ?').get(slug);
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }
  return NextResponse.json(doc);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json();

  const existing = db.prepare('SELECT * FROM long_term_docs WHERE slug = ?').get(slug);
  if (!existing) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const fields = ['title', 'content'];
  const updates: string[] = ["updated_at = datetime('now', 'localtime')"];
  const values: unknown[] = [];

  for (const field of fields) {
    if (body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(body[field]);
    }
  }

  if (values.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(slug);
  db.prepare(`UPDATE long_term_docs SET ${updates.join(', ')} WHERE slug = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM long_term_docs WHERE slug = ?').get(slug);
  return NextResponse.json(updated);
}
