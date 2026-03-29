import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Memory, LongTermDoc } from '@/lib/types';

// GET /api/memories/context?project=slug — returns recent memories + long-term docs for agent context
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const project = searchParams.get('project');

  let recentQuery = 'SELECT * FROM memories';
  const params: string[] = [];

  if (project) {
    recentQuery += ' WHERE project = ?';
    params.push(project);
  }
  recentQuery += ' ORDER BY created_at DESC LIMIT 20';

  const recentMemories = db.prepare(recentQuery).all(...params) as Memory[];
  const longTermDocs = db.prepare('SELECT * FROM long_term_docs ORDER BY title ASC').all() as LongTermDoc[];

  return NextResponse.json({
    recent_memories: recentMemories,
    long_term_docs: longTermDocs,
  });
}
