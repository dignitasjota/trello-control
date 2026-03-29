import db from './db';
import { randomUUID } from 'crypto';
import { Task } from './types';

export function logTaskActivity(
  taskId: string,
  action: 'created' | 'updated' | 'status_changed' | 'deleted' | 'subtask_added' | 'subtask_completed',
  field?: string,
  oldValue?: string,
  newValue?: string
) {
  const id = randomUUID();
  const stmt = db.prepare(`
    INSERT INTO task_activity (id, task_id, action, field, old_value, new_value)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, taskId, action, field || null, oldValue || null, newValue || null);
}

export function logTaskChanges(taskId: string, oldTask: Partial<Task>, newTask: Partial<Task>) {
  const fieldsToTrack = ['title', 'description', 'status', 'priority', 'assignee', 'project', 'due_date', 'tags', 'estimate'] as const;

  for (const field of fieldsToTrack) {
    const oldVal = oldTask[field];
    const newVal = newTask[field];

    if (oldVal !== newVal && newVal !== undefined) {
      const action = field === 'status' ? 'status_changed' : 'updated';
      logTaskActivity(
        taskId,
        action,
        field,
        String(oldVal || ''),
        String(newVal)
      );
    }
  }
}

export function getTaskActivity(taskId: string) {
  return db.prepare(`
    SELECT id, task_id, action, field, old_value, new_value, created_at
    FROM task_activity
    WHERE task_id = ?
    ORDER BY created_at DESC
  `).all(taskId);
}

export function getProjectActivity(projectSlug: string, limit: number = 50) {
  return db.prepare(`
    SELECT ta.id, ta.task_id, t.title, t.status, ta.action, ta.field, ta.old_value, ta.new_value, ta.created_at
    FROM task_activity ta
    JOIN tasks t ON ta.task_id = t.id
    WHERE t.project = ?
    ORDER BY ta.created_at DESC
    LIMIT ?
  `).all(projectSlug, limit);
}
