import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const project = searchParams.get('project');

  let query = 'SELECT * FROM tasks WHERE archived = 1';
  const params: string[] = [];

  if (project) {
    query += ' AND project = ?';
    params.push(project);
  }

  query += ' ORDER BY created_at DESC';

  const tasks = db.prepare(query).all(...params);
  return NextResponse.json(tasks);
}
