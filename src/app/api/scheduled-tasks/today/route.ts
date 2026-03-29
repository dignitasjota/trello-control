import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { taskOccursOnDate } from '@/lib/schedule-utils';
import type { ScheduledTask, ScheduledExecution, Frequency } from '@/lib/types';

// GET /api/scheduled-tasks/today — returns today's scheduled tasks with execution status
export async function GET() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const allTasks = db.prepare('SELECT * FROM scheduled_tasks WHERE active = 1').all() as ScheduledTask[];

  const todayExecutions = db.prepare(
    "SELECT * FROM scheduled_executions WHERE date(executed_at) = ?"
  ).all(todayStr) as ScheduledExecution[];

  const executedTaskIds = new Set(todayExecutions.map(e => e.task_id));

  const todayTasks = allTasks
    .filter(task => taskOccursOnDate(task.frequency as Frequency, task.created_at, task.cron_expression, today))
    .map(task => ({
      ...task,
      executed_today: executedTaskIds.has(task.id),
      executions_today: todayExecutions.filter(e => e.task_id === task.id),
    }));

  return NextResponse.json(todayTasks);
}
