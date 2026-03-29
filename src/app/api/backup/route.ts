import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
  const subtasks = db.prepare('SELECT * FROM subtasks ORDER BY position ASC').all();
  const scheduledTasks = db.prepare('SELECT * FROM scheduled_tasks ORDER BY created_at DESC').all();
  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  const memories = db.prepare('SELECT * FROM memories ORDER BY created_at DESC').all();
  const longTermDocs = db.prepare('SELECT * FROM long_term_docs').all();
  const documents = db.prepare('SELECT * FROM documents ORDER BY created_at DESC').all();
  const settings = db.prepare('SELECT * FROM settings').all();

  const backup = {
    version: 1,
    exported_at: new Date().toISOString(),
    data: { tasks, subtasks, scheduledTasks, projects, memories, longTermDocs, documents, settings },
  };

  return NextResponse.json(backup, {
    headers: {
      'Content-Disposition': `attachment; filename="centro-control-backup-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}
