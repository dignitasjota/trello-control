import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import type { Project } from '@/lib/types';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = db.prepare('SELECT * FROM projects WHERE slug = ?').get(slug) as Project | undefined;
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const body = await request.json();
  const { name, url = '', notes = '' } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO project_documents (id, project_id, name, url, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, project.id, name, url, notes);

  // Touch project updated_at
  db.prepare("UPDATE projects SET updated_at = datetime('now', 'localtime') WHERE id = ?").run(project.id);

  const doc = db.prepare('SELECT * FROM project_documents WHERE id = ?').get(id);
  return NextResponse.json(doc, { status: 201 });
}
