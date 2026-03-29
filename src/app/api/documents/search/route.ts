import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q') || '';
  if (!q.trim()) {
    return NextResponse.json([]);
  }

  const like = `%${q}%`;
  const docs = db.prepare(
    'SELECT * FROM documents WHERE title LIKE ? OR content LIKE ? ORDER BY updated_at DESC'
  ).all(like, like);

  return NextResponse.json(docs);
}
