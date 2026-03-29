import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface Notification {
  id: string;
  type: 'overdue' | 'due_soon' | 'review' | 'scheduled';
  title: string;
  message: string;
  task_id?: string;
  priority?: string;
}

export async function GET() {
  const notifications: Notification[] = [];

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Overdue tasks
  const overdue = db.prepare(
    "SELECT id, title, due_date, priority FROM tasks WHERE due_date < ? AND status != 'terminado' ORDER BY due_date ASC"
  ).all(todayStr) as { id: string; title: string; due_date: string; priority: string }[];

  for (const t of overdue) {
    const days = Math.ceil((today.getTime() - new Date(t.due_date + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24));
    notifications.push({
      id: `overdue-${t.id}`,
      type: 'overdue',
      title: t.title,
      message: `Vencida hace ${days} dia${days > 1 ? 's' : ''}`,
      task_id: t.id,
      priority: t.priority,
    });
  }

  // Due soon (today or next 2 days)
  const soonEnd = new Date(today);
  soonEnd.setDate(soonEnd.getDate() + 2);
  const soonEndStr = soonEnd.toISOString().slice(0, 10);

  const dueSoon = db.prepare(
    "SELECT id, title, due_date FROM tasks WHERE due_date >= ? AND due_date <= ? AND status != 'terminado' ORDER BY due_date ASC"
  ).all(todayStr, soonEndStr) as { id: string; title: string; due_date: string }[];

  for (const t of dueSoon) {
    const days = Math.ceil((new Date(t.due_date + 'T00:00:00').getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const msg = days === 0 ? 'Vence hoy' : `Vence en ${days} dia${days > 1 ? 's' : ''}`;
    notifications.push({
      id: `due-${t.id}`,
      type: 'due_soon',
      title: t.title,
      message: msg,
      task_id: t.id,
    });
  }

  // Tasks in review
  const review = db.prepare(
    "SELECT id, title FROM tasks WHERE status = 'revision' ORDER BY position ASC"
  ).all() as { id: string; title: string }[];

  for (const t of review) {
    notifications.push({
      id: `review-${t.id}`,
      type: 'review',
      title: t.title,
      message: 'Pendiente de revision',
      task_id: t.id,
    });
  }

  return NextResponse.json(notifications);
}
