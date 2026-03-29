import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/memories/search?q=texto — full-text search across title and content
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) {
    return NextResponse.json([]);
  }

  const pattern = `%${q}%`;
  const memories = db.prepare(`
    SELECT * FROM memories
    WHERE title LIKE ? OR content LIKE ?
    ORDER BY created_at DESC
  `).all(pattern, pattern);

  return NextResponse.json(memories);
}
