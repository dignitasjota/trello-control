'use client';

import { useEffect, useState } from 'react';
import type { ScheduledTask, Frequency } from '@/lib/types';
import { FREQUENCY_LABELS, FREQUENCY_COLORS } from '@/lib/types';
import { taskOccursOnDate } from '@/lib/schedule-utils';

interface DayDetailProps {
  date: Date;
  tasks: ScheduledTask[];
  onClose: () => void;
  onEdit: (task: ScheduledTask) => void;
}

interface ExecutionMap {
  [taskId: string]: boolean;
}

export default function DayDetail({ date, tasks, onClose, onEdit }: DayDetailProps) {
  const [executions, setExecutions] = useState<ExecutionMap>({});

  const dayTasks = tasks.filter(t =>
    taskOccursOnDate(t.frequency as Frequency, t.created_at, t.cron_expression, date)
  );

  const dateStr = date.toISOString().split('T')[0];

  useEffect(() => {
    async function loadExecutions() {
      const map: ExecutionMap = {};
      for (const task of dayTasks) {
        const res = await fetch(`/api/scheduled-tasks/${task.id}/executions?date=${dateStr}`);
        const data = await res.json();
        map[task.id] = data.length > 0;
      }
      setExecutions(map);
    }
    loadExecutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr, tasks]);

  const handleExecute = async (taskId: string) => {
    await fetch(`/api/scheduled-tasks/${taskId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    setExecutions(prev => ({ ...prev, [taskId]: true }));
  };

  const formattedDate = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 capitalize">{formattedDate}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{dayTasks.length} tarea{dayTasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
        {dayTasks.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-8">Sin tareas programadas</p>
        ) : (
          dayTasks.map(task => {
            const executed = executions[task.id];
            return (
              <div
                key={task.id}
                className={`rounded-lg border p-3 transition-colors ${
                  executed
                    ? 'border-green-500/30 bg-green-500/5'
                    : !task.active
                    ? 'border-zinc-700/30 bg-zinc-800/30 opacity-50'
                    : 'border-zinc-700/50 bg-zinc-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-medium leading-tight ${executed ? 'text-green-300 line-through' : 'text-zinc-100'}`}>
                        {task.name}
                      </h3>
                    </div>
                    {task.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${FREQUENCY_COLORS[task.frequency as Frequency]}`}>
                        {FREQUENCY_LABELS[task.frequency as Frequency]}
                      </span>
                      <span className="text-[10px] text-zinc-500">{task.scheduled_time}</span>
                      {!task.active && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-600/30 bg-zinc-700/30 text-zinc-500">
                          Pausada
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => onEdit(task)}
                      className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    {!executed && task.active && (
                      <button
                        onClick={() => handleExecute(task.id)}
                        className="p-1 rounded hover:bg-green-900/50 text-zinc-400 hover:text-green-400"
                        title="Marcar como ejecutada"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
