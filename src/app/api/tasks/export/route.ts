import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';
  const project = searchParams.get('project');
  const includeArchived = searchParams.get('archived') === 'true';

  let query = 'SELECT * FROM tasks';
  const params: string[] = [];

  if (!includeArchived) {
    query += ' WHERE archived = 0';
  }
  if (project) {
    query += (includeArchived ? ' WHERE' : ' AND') + ' project = ?';
    params.push(project);
  }

  query += ' ORDER BY created_at DESC';

  const tasks = db.prepare(query).all(...params) as Record<string, unknown>[];

  if (format === 'csv') {
    const headers = ['id', 'title', 'description', 'status', 'priority', 'assignee', 'project', 'due_date', 'tags', 'estimate', 'created_at'];
    const csv = [
      headers.join(','),
      ...tasks.map(t =>
        headers
          .map(h => {
            const val = t[h];
            const str = String(val ?? '');
            return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
          })
          .join(',')
      ),
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="tasks.csv"',
      },
    });
  }

  // Default: JSON
  return NextResponse.json(tasks, {
    headers: {
      'Content-Disposition': 'attachment; filename="tasks.json"',
    },
  });
}
