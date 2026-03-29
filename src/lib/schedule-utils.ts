import type { Frequency } from './types';

/**
 * Determines whether a scheduled task should appear on a given date
 * based on its frequency, creation date, and cron expression.
 */
export function taskOccursOnDate(
  frequency: Frequency,
  createdAt: string,
  cronExpression: string,
  targetDate: Date
): boolean {
  const created = new Date(createdAt);
  const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());

  if (target < createdDay) return false;

  switch (frequency) {
    case 'unica':
      return target.getTime() === createdDay.getTime();

    case 'diaria':
      return true;

    case 'semanal':
      return target.getDay() === createdDay.getDay();

    case 'mensual':
      return target.getDate() === createdDay.getDate();

    case 'personalizada': {
      if (!cronExpression) return false;
      // Parse simplified cron: "days:0,1,2,3,4" (0=Sunday)
      // or "dom:1,15" (day of month)
      if (cronExpression.startsWith('days:')) {
        const days = cronExpression.replace('days:', '').split(',').map(Number);
        return days.includes(target.getDay());
      }
      if (cronExpression.startsWith('dom:')) {
        const doms = cronExpression.replace('dom:', '').split(',').map(Number);
        return doms.includes(target.getDate());
      }
      return false;
    }

    default:
      return false;
  }
}
