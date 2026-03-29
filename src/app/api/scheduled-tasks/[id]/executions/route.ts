import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/scheduled-tasks/:id/executions — list executions for a task
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date'); // YYYY-MM-DD

  let query = 'SELECT * FROM scheduled_executions WHERE task_id = ?';
  const queryParams: string[] = [id];

  if (date) {
    query += " AND date(executed_at) = ?";
    queryParams.push(date);
  }

  query += ' ORDER BY executed_at DESC';

  const executions = db.prepare(query).all(...queryParams);
  return NextResponse.json(executions);
}
