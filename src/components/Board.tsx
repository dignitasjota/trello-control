'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, Status, COLUMNS } from '@/lib/types';
import Column from './Column';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import ConfirmDialog from './ConfirmDialog';
import ExportImport from './ExportImport';
import { useToast } from './Toast';

interface ProjectOption {
  slug: string;
  name: string;
}

export default function Board() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalTask, setModalTask] = useState<Partial<Task> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<Status>('pendiente');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Filters
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(setProjects)
      .catch(() => {});
  }, []);

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks?include_subtasks=1');
    const data = await res.json();
    setTasks(data);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter(t => {
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterAssignee && t.assignee !== filterAssignee) return false;
    if (filterProject && t.project !== filterProject) return false;
    if (filterTag && !(t.tags || '').split(',').includes(filterTag)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const hasFilters = !!(filterPriority || filterAssignee || filterProject || filterTag || searchQuery);

  // Collect all unique tags for the filter dropdown
  const allTags = Array.from(new Set(tasks.flatMap(t => (t.tags || '').split(',').filter(Boolean)))).sort();

  const getTasksByStatus = (status: Status) =>
    filteredTasks.filter(t => t.status === status).sort((a, b) => a.position - b.position);

  const handleAdd = (status: Status) => {
    setDefaultStatus(status);
    setModalTask({});
    setModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setModalTask(task);
    setDefaultStatus(task.status);
    setModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setDeleteTarget(task ? { id: task.id, title: task.title } : null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const deletedTask = tasks.find(t => t.id === deleteTarget.id);
    await fetch(`/api/tasks/${deleteTarget.id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
    setDeleteTarget(null);

    if (deletedTask) {
      showToast(`"${deletedTask.title}" eliminada`, async () => {
        // Undo: re-create the task
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: deletedTask.title,
            description: deletedTask.description,
            status: deletedTask.status,
            priority: deletedTask.priority,
            assignee: deletedTask.assignee,
            project: deletedTask.project,
            due_date: deletedTask.due_date,
            tags: deletedTask.tags,
            estimate: deletedTask.estimate,
          }),
        });
        if (res.ok) fetchTasks();
      });
    }
  };

  const handleArchive = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: 1 }),
    });
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast(`"${task.title}" archivada`, async () => {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: 0 }),
      });
      fetchTasks();
    });
  };

  const handleSave = async (data: Partial<Task>) => {
    if (data.id) {
      const res = await fetch(`/api/tasks/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    } else {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setTasks(prev => [...prev, created]);
    }
    setModalOpen(false);
    setModalTask(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskItem = tasks.find(t => t.id === activeId);
    if (!activeTaskItem) return;

    // Check if dropping over a column
    const isOverColumn = COLUMNS.some(c => c.id === overId);
    const overTask = tasks.find(t => t.id === overId);

    let newStatus: Status;
    if (isOverColumn) {
      newStatus = overId as Status;
    } else if (overTask) {
      newStatus = overTask.status;
    } else {
      return;
    }

    if (activeTaskItem.status !== newStatus) {
      setTasks(prev => prev.map(t =>
        t.id === activeId ? { ...t, status: newStatus } : t
      ));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskItem = tasks.find(t => t.id === activeId);
    if (!activeTaskItem) return;

    const isOverColumn = COLUMNS.some(c => c.id === overId);

    if (!isOverColumn && activeId !== overId) {
      const columnTasks = getTasksByStatus(activeTaskItem.status);
      const oldIndex = columnTasks.findIndex(t => t.id === activeId);
      const newIndex = columnTasks.findIndex(t => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        const updatedTasks = tasks.map(t => {
          const idx = reordered.findIndex(r => r.id === t.id);
          if (idx !== -1) return { ...t, position: idx };
          return t;
        });
        setTasks(updatedTasks);

        // Update positions in DB
        for (const [i, t] of reordered.entries()) {
          await fetch(`/api/tasks/${t.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: i }),
          });
        }
      }
    }

    // Persist status change
    await fetch(`/api/tasks/${activeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: activeTaskItem.status }),
    });

    fetchTasks();
  };

  return (
    <>
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tareas..."
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
        >
          <option value="">Prioridad</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
        >
          <option value="">Asignado</option>
          <option value="yo">Yo</option>
          <option value="agente">Agente</option>
        </select>

        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
        >
          <option value="">Proyecto</option>
          {projects.map(p => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>

        {allTags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
          >
            <option value="">Etiqueta</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        )}

        <div className="flex gap-2 ml-auto">
          <ExportImport onImportComplete={fetchTasks} />
          {hasFilters && (
            <button
              onClick={() => { setFilterPriority(''); setFilterAssignee(''); setFilterProject(''); setFilterTag(''); setSearchQuery(''); }}
              className="px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-8rem)]">
          {COLUMNS.map(col => (
            <Column
              key={col.id}
              id={col.id}
              label={col.label}
              tasks={getTasksByStatus(col.id)}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onArchive={handleArchive}
              onAdd={handleAdd}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
          )}
        </DragOverlay>
      </DndContext>

      {modalOpen && (
        <TaskModal
          task={modalTask}
          defaultStatus={defaultStatus}
          onClose={() => { setModalOpen(false); setModalTask(null); }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar tarea"
          message={`¿Estas seguro de eliminar "${deleteTarget.title}"? Esta accion no se puede deshacer.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
