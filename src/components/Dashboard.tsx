'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Task } from '@/lib/types';

interface ScheduledToday {
  id: string;
  name: string;
  scheduled_time: string;
  executed_today: boolean;
}

interface ProjectSummary {
  slug: string;
  name: string;
  color: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  review_tasks: number;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledToday[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/scheduled-tasks/today').then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
    ]).then(([t, s, p]) => {
      setTasks(t);
      setScheduled(s);
      setProjects(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-zinc-500 text-sm">Cargando...</div>;
  }

  const pendientes = tasks.filter(t => t.status === 'pendiente');
  const enProgreso = tasks.filter(t => t.status === 'en_progreso');
  const enRevision = tasks.filter(t => t.status === 'revision');
  const terminadas = tasks.filter(t => t.status === 'terminado');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue = tasks.filter(t => {
    if (!t.due_date || t.status === 'terminado') return false;
    const due = new Date(t.due_date + 'T00:00:00');
    return due < today;
  });

  const dueSoon = tasks.filter(t => {
    if (!t.due_date || t.status === 'terminado') return false;
    const due = new Date(t.due_date + 'T00:00:00');
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  });

  const scheduledPending = scheduled.filter(s => !s.executed_today);
  const scheduledDone = scheduled.filter(s => s.executed_today);

  const activeProjects = projects.filter((p: ProjectSummary & { archived?: number }) => !p.archived);

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pendientes" value={pendientes.length} color="text-zinc-400" href="/" />
        <StatCard label="En progreso" value={enProgreso.length} color="text-blue-400" href="/" />
        <StatCard label="En revision" value={enRevision.length} color="text-amber-400" href="/" />
        <StatCard label="Completadas" value={terminadas.length} color="text-green-400" href="/" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgente */}
        {(overdue.length > 0 || dueSoon.length > 0) && (
          <div className="rounded-xl border border-zinc-800 p-5">
            <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Atencion requerida
            </h3>
            <div className="space-y-2">
              {overdue.map(t => (
                <TaskRow key={t.id} task={t} tag="Vencida" tagColor="text-red-400 bg-red-500/10 border-red-500/30" />
              ))}
              {dueSoon.map(t => (
                <TaskRow key={t.id} task={t} tag="Proxima" tagColor="text-amber-400 bg-amber-500/10 border-amber-500/30" />
              ))}
            </div>
          </div>
        )}

        {/* Tareas en revision */}
        {enRevision.length > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h3 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              En revision ({enRevision.length})
            </h3>
            <div className="space-y-2">
              {enRevision.map(t => (
                <div key={t.id} className="flex items-center gap-2 text-sm text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="truncate">{t.title}</span>
                  {t.project && <span className="text-[10px] text-zinc-500 ml-auto">#{t.project}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Programadas hoy */}
        <div className="rounded-xl border border-zinc-800 p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Programadas hoy
            <span className="text-xs text-zinc-500 font-normal ml-auto">
              {scheduledDone.length}/{scheduled.length} completadas
            </span>
          </h3>
          {scheduled.length === 0 ? (
            <p className="text-xs text-zinc-500">No hay tareas programadas para hoy</p>
          ) : (
            <div className="space-y-2">
              {scheduled.map(s => (
                <div key={s.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.executed_today ? 'bg-green-400' : 'bg-zinc-500'}`} />
                  <span className={`truncate ${s.executed_today ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{s.name}</span>
                  <span className="text-[10px] text-zinc-600 ml-auto">{s.scheduled_time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proyectos activos */}
        <div className="rounded-xl border border-zinc-800 p-5">
          <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Proyectos activos ({activeProjects.length})
          </h3>
          {activeProjects.length === 0 ? (
            <p className="text-xs text-zinc-500">No hay proyectos activos</p>
          ) : (
            <div className="space-y-2.5">
              {activeProjects.slice(0, 6).map(p => {
                const pct = p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0;
                return (
                  <Link key={p.slug} href={`/proyectos/${p.slug}`} className="block group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-300 group-hover:text-zinc-100 transition-colors">{p.name}</span>
                      <span className="text-[10px] text-zinc-500">{pct}%</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: p.color }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, href }: { label: string; value: number; color: string; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-colors">
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      <p className={`text-xs font-medium mt-1 ${color}`}>{label}</p>
    </Link>
  );
}

function TaskRow({ task, tag, tagColor }: { task: Task; tag: string; tagColor: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="truncate text-zinc-300">{task.title}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ml-auto flex-shrink-0 ${tagColor}`}>{tag}</span>
      {task.due_date && (
        <span className="text-[10px] text-zinc-500 flex-shrink-0">
          {new Date(task.due_date + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
        </span>
      )}
    </div>
  );
}
