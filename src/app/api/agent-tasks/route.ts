import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/agent-tasks — returns pending tasks assigned to the agent
// Optional: ?status=en_progreso to get agent tasks in other columns
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = "SELECT * FROM tasks WHERE assignee = 'agente'";
  const params: string[] = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  } else {
    query += " AND status = 'pendiente'";
  }

  query += ' ORDER BY position ASC, created_at DESC';

  const tasks = db.prepare(query).all(...params);
  return NextResponse.json(tasks);
}
