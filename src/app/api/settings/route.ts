import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  // Include API token status (read-only, from env)
  settings['api_token_configured'] = process.env.API_TOKEN ? 'true' : 'false';

  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const allowedKeys = ['user_name', 'user_role', 'notifications_enabled', 'notifications_interval', 'default_priority', 'default_assignee'];

  const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');

  for (const [key, value] of Object.entries(body)) {
    if (allowedKeys.includes(key)) {
      upsert.run(key, String(value));
    }
  }

  // Return updated settings
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  settings['api_token_configured'] = process.env.API_TOKEN ? 'true' : 'false';

  return NextResponse.json(settings);
}
