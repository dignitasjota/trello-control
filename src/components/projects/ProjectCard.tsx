'use client';

import Link from 'next/link';
import type { ProjectWithStats } from '@/lib/types';
import ProjectIcon from './ProjectIcon';

interface ProjectCardProps {
  project: ProjectWithStats;
  onEdit: (project: ProjectWithStats) => void;
  onArchive: (slug: string) => void;
}

export default function ProjectCard({ project, onEdit, onArchive }: ProjectCardProps) {
  const progress = project.total_tasks > 0
    ? Math.round((project.completed_tasks / project.total_tasks) * 100)
    : 0;

  const isStale = project.days_inactive > 7;

  return (
    <div className={`group rounded-xl border p-4 transition-all ${
      project.archived
        ? 'border-zinc-800/50 bg-zinc-900/30 opacity-60'
        : isStale
        ? 'border-amber-500/30 bg-zinc-900/50'
        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link href={`/proyectos/${project.slug}`} className="flex items-center gap-3 min-w-0 flex-1">
          <ProjectIcon icon={project.icon} color={project.color} />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-zinc-100 truncate">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-zinc-400 truncate mt-0.5">{project.description}</p>
            )}
          </div>
        </Link>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(project)}
            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => onArchive(project.slug)}
            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
            title={project.archived ? 'Desarchivar' : 'Archivar'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-zinc-500">{progress}% completado</span>
          <span className="text-[10px] text-zinc-500">
            {project.completed_tasks}/{project.total_tasks}
          </span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: project.color,
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[11px]">
        {project.pending_tasks > 0 && (
          <span className="text-zinc-400">{project.pending_tasks} pendiente{project.pending_tasks !== 1 ? 's' : ''}</span>
        )}
        {project.in_progress_tasks > 0 && (
          <span className="text-blue-400">{project.in_progress_tasks} en progreso</span>
        )}
        {project.review_tasks > 0 && (
          <span className="text-amber-400">{project.review_tasks} en revision</span>
        )}
      </div>

      {/* Last activity */}
      <div className="flex items-center gap-1.5 mt-2">
        {isStale && !project.archived && (
          <span className="flex items-center gap-1 text-[10px] text-amber-400">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {project.days_inactive}d sin actividad
          </span>
        )}
        {!isStale && project.last_activity && (
          <span className="text-[10px] text-zinc-500">
            Ultima actividad: {new Date(project.last_activity).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
          </span>
        )}
        {project.archived && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-500">
            Archivado
          </span>
        )}
      </div>
    </div>
  );
}
