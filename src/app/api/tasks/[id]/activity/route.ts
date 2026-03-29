import { NextRequest, NextResponse } from 'next/server';
import { getTaskActivity } from '@/lib/activity';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = getTaskActivity(id);
  return NextResponse.json(activity);
}
