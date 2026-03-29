import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  const cats = db.prepare('SELECT * FROM document_categories ORDER BY name').all();
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, color = '#71717a' } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const id = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    db.prepare('INSERT INTO document_categories (id, name, color) VALUES (?, ?, ?)').run(id || randomUUID(), name, color);
  } catch {
    return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
  }

  const cat = db.prepare('SELECT * FROM document_categories WHERE id = ?').get(id);
  return NextResponse.json(cat, { status: 201 });
}
