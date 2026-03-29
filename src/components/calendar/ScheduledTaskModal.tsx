'use client';

import { useState, useEffect } from 'react';
import type { ScheduledTask, Frequency } from '@/lib/types';

interface ScheduledTaskModalProps {
  task: Partial<ScheduledTask> | null;
  onClose: () => void;
  onSave: (data: Partial<ScheduledTask>) => void;
}

export default function ScheduledTaskModal({ task, onClose, onSave }: ScheduledTaskModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('diaria');
  const [cronExpression, setCronExpression] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (task) {
      setName(task.name || '');
      setDescription(task.description || '');
      setFrequency((task.frequency as Frequency) || 'diaria');
      setCronExpression(task.cron_expression || '');
      setScheduledTime(task.scheduled_time || '09:00');
      setActive(task.active !== undefined ? !!task.active : true);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...task,
      name,
      description,
      frequency,
      cron_expression: cronExpression,
      scheduled_time: scheduledTime,
      active: active ? 1 : 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl"
      >
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">
          {task?.id ? 'Editar tarea programada' : 'Nueva tarea programada'}
        </h2>

        <div className="space-y-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la tarea"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripcion (opcional)"
            rows={2}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Frecuencia</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="unica">Unica</option>
                <option value="diaria">Diaria</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
                <option value="personalizada">Personalizada</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Hora</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          {frequency === 'personalizada' && (
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">
                Expresion personalizada
              </label>
              <input
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                placeholder="days:1,3,5 o dom:1,15"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                days:0-6 (0=Dom) o dom:1-31 (dia del mes)
              </p>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-sm text-zinc-300">Activa</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-50 font-medium transition-colors"
          >
            {task?.id ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
