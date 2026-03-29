import { NextRequest, NextResponse } from 'next/server';
import { getProjectActivity } from '@/lib/activity';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const activity = getProjectActivity(slug, limit);
  return NextResponse.json(activity);
}
