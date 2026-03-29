import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const docs = db.prepare('SELECT * FROM long_term_docs ORDER BY title ASC').all();
  return NextResponse.json(docs);
}
