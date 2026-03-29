'use client';

import { TaskActivity } from '@/lib/types';
import { useEffect, useState } from 'react';

interface ActivityTimelineProps {
  taskId?: string;
  projectSlug?: string;
  limit?: number;
}

const ACTION_LABELS: Record<string, string> = {
  created: 'Creada',
  updated: 'Actualizada',
  status_changed: 'Estado cambiado',
  deleted: 'Eliminada',
  subtask_added: 'Subtarea agregada',
  subtask_completed: 'Subtarea completada',
};

const FIELD_LABELS: Record<string, string> = {
  title: 'Título',
  description: 'Descripción',
  status: 'Estado',
  priority: 'Prioridad',
  assignee: 'Asignado a',
  project: 'Proyecto',
  due_date: 'Fecha de vencimiento',
  tags: 'Etiquetas',
  estimate: 'Estimación',
};

export default function ActivityTimeline({ taskId, projectSlug, limit = 50 }: ActivityTimelineProps) {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const url = taskId
          ? `/api/tasks/${taskId}/activity`
          : projectSlug
            ? `/api/projects/${projectSlug}/activity?limit=${limit}`
            : null;

        if (!url) return;

        const res = await fetch(url);
        const data = await res.json();
        setActivity(data);
      } catch (e) {
        console.error('Failed to load activity:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [taskId, projectSlug, limit]);

  if (loading) {
    return <div className="text-xs text-zinc-500">Cargando historial...</div>;
  }

  if (activity.length === 0) {
    return <div className="text-xs text-zinc-500">Sin actividad</div>;
  }

  return (
    <div className="space-y-2">
      {activity.map((item: TaskActivity) => {
        const actionLabel = ACTION_LABELS[item.action] || item.action;
        const fieldLabel = item.field ? FIELD_LABELS[item.field] || item.field : '';

        const timestamp = new Date(item.created_at);
        const timeStr = timestamp.toLocaleString('es-ES', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={item.id} className="flex gap-2 text-xs">
            <div className="text-zinc-500 whitespace-nowrap">{timeStr}</div>
            <div className="flex-1">
              {item.action === 'status_changed' ? (
                <span className="text-zinc-300">
                  {actionLabel}: <span className="text-blue-400">{item.old_value}</span> →{' '}
                  <span className="text-blue-400">{item.new_value}</span>
                </span>
              ) : item.field ? (
                <span className="text-zinc-300">
                  {fieldLabel}: <span className="text-amber-400">{item.old_value || '—'}</span> →{' '}
                  <span className="text-amber-400">{item.new_value || '—'}</span>
                </span>
              ) : (
                <span className="text-zinc-300">{actionLabel}</span>
              )}
              {(item as any).title && (
                <span className="ml-2 text-zinc-500">({(item as any).title})</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
