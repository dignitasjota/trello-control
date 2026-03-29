'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, Status } from '@/lib/types';
import TaskCard from './TaskCard';

interface ColumnProps {
  id: Status;
  label: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onAdd: (status: Status) => void;
}

const COLUMN_ACCENTS: Record<Status, string> = {
  pendiente: 'border-t-zinc-500',
  en_progreso: 'border-t-blue-500',
  revision: 'border-t-amber-500',
  terminado: 'border-t-green-500',
};

export default function Column({ id, label, tasks, onEdit, onDelete, onArchive, onAdd }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const totalPoints = tasks.reduce((sum, t) => sum + (t.estimate || 0), 0);

  return (
    <div
      className={`
        flex flex-col rounded-xl border border-t-2 bg-zinc-900/50
        ${COLUMN_ACCENTS[id]}
        ${isOver ? 'border-zinc-500 bg-zinc-800/50' : 'border-zinc-800'}
        transition-colors duration-150
      `}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-300">{label}</h2>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
          {totalPoints > 0 && (
            <span className="text-[10px] text-indigo-400/70">{totalPoints}pt</span>
          )}
        </div>
        <button
          onClick={() => onAdd(id)}
          className="p-1 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 px-3 pb-3 space-y-2 min-h-[200px] overflow-y-auto"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onArchive={onArchive} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
