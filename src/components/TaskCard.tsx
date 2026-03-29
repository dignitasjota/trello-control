'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, PRIORITY_COLORS } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onArchive }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isReview = task.status === 'revision';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group rounded-lg border p-3 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 shadow-2xl' : ''}
        ${isReview
          ? 'border-amber-500/50 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
          : 'border-zinc-700/50 bg-zinc-800/50 hover:border-zinc-600/50'
        }
        transition-all duration-150
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-zinc-100 leading-tight">{task.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
            title="Editar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          {onArchive && (
            <button
              onClick={(e) => { e.stopPropagation(); onArchive(task.id); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-amber-400"
              title="Archivar"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v4m4-4v4" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-red-400"
            title="Eliminar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-zinc-400 mb-2 line-clamp-2">{task.description}</p>
      )}

      {task.subtasks && task.subtasks.length > 0 && (() => {
        const total = task.subtasks.length;
        const done = task.subtasks.filter(s => s.completed).length;
        return (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
            </div>
            <span className="text-[10px] text-zinc-500">{done}/{total}</span>
          </div>
        );
      })()}

      <div className="flex flex-wrap items-center gap-1.5 mt-auto">
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        {task.estimate && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-medium">
            {task.estimate}pt
          </span>
        )}
        {task.project && (
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400">
            {task.project}
          </span>
        )}
        {task.tags && task.tags.split(',').filter(Boolean).map(tag => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            {tag}
          </span>
        ))}
        {task.assignee && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ml-auto font-medium ${
            task.assignee === 'agente'
              ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
              : 'border-zinc-600/30 bg-zinc-700/30 text-zinc-400'
          }`}>
            {task.assignee === 'agente' ? 'Agente' : 'Yo'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-500">
        <span>{new Date(task.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
        {task.due_date && (() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const due = new Date(task.due_date + 'T00:00:00');
          const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const isOverdue = diffDays < 0 && task.status !== 'terminado';
          const isUrgent = diffDays >= 0 && diffDays <= 2 && task.status !== 'terminado';
          return (
            <span className={`flex items-center gap-0.5 ${isOverdue ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-zinc-500'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {due.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
            </span>
          );
        })()}
        {task.completed_at && (
          <span className="text-green-500">
            ✓ {new Date(task.completed_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
          </span>
        )}
      </div>
    </div>
  );
}
