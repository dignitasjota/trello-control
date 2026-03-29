'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, Status, Priority, Subtask, ESTIMATE_OPTIONS } from '@/lib/types';
import ActivityTimeline from './ActivityTimeline';

interface ProjectOption {
  slug: string;
  name: string;
}

interface TaskModalProps {
  task: Partial<Task> | null;
  defaultStatus?: Status;
  onClose: () => void;
  onSave: (data: Partial<Task>) => void;
}

export default function TaskModal({ task, defaultStatus, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [assignee, setAssignee] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState<Status>(defaultStatus || 'pendiente');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [estimate, setEstimate] = useState<number | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then((data: ProjectOption[]) => setProjects(data))
      .catch(() => {});
  }, []);

  const fetchSubtasks = useCallback(async () => {
    if (!task?.id) return;
    const res = await fetch(`/api/tasks/${task.id}/subtasks`);
    const data = await res.json();
    setSubtasks(data);
  }, [task?.id]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'media');
      setAssignee(task.assignee || '');
      setProject(task.project || '');
      setStatus(task.status || defaultStatus || 'pendiente');
      setDueDate(task.due_date || '');
      setTags(task.tags ? task.tags.split(',').filter(Boolean) : []);
      setEstimate(task.estimate ?? null);
      if (task.subtasks) {
        setSubtasks(task.subtasks);
      }
    }
  }, [task, defaultStatus]);

  useEffect(() => {
    if (task?.id) fetchSubtasks();
  }, [task?.id, fetchSubtasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ ...task, title, description, priority, assignee, project, status, due_date: dueDate || null, tags: tags.join(','), estimate } as Partial<Task>);
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !task?.id) return;
    const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newSubtask }),
    });
    if (res.ok) {
      const created = await res.json();
      setSubtasks(prev => [...prev, created]);
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = async (sub: Subtask) => {
    if (!task?.id) return;
    const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sub.id, completed: !sub.completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSubtasks(prev => prev.map(s => s.id === updated.id ? updated : s));
    }
  };

  const handleDeleteSubtask = async (subId: string) => {
    if (!task?.id) return;
    await fetch(`/api/tasks/${task.id}/subtasks?subId=${subId}`, { method: 'DELETE' });
    setSubtasks(prev => prev.filter(s => s.id !== subId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
      >
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">
          {task?.id ? 'Editar tarea' : 'Nueva tarea'}
        </h2>

        <div className="space-y-3 overflow-y-auto flex-1">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo de la tarea"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripcion (opcional)"
            rows={3}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="revision">Revision</option>
                <option value="terminado">Terminado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Asignado a</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="">Sin asignar</option>
                <option value="yo">Yo</option>
                <option value="agente">Agente</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Proyecto</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="">Sin proyecto</option>
                {projects.map(p => (
                  <option key={p.slug} value={p.slug}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha limite */}
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Fecha limite (opcional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Tags + Estimate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Etiquetas</label>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    {tag}
                    <button type="button" onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="hover:text-red-400">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Agregar etiqueta..."
                className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                    e.preventDefault();
                    const val = tagInput.trim().toLowerCase().replace(/,/g, '');
                    if (val && !tags.includes(val)) setTags(prev => [...prev, val]);
                    setTagInput('');
                  }
                }}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Estimacion</label>
              <div className="flex gap-1 flex-wrap">
                {ESTIMATE_OPTIONS.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setEstimate(estimate === n ? null : n)}
                    className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                      estimate === n
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : 'border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subtasks */}
          {task?.id && (
            <div>
              <label className="text-xs text-zinc-400 mb-2 block">
                Subtareas {subtasks.length > 0 && `(${subtasks.filter(s => s.completed).length}/${subtasks.length})`}
              </label>

              {subtasks.length > 0 && (
                <div className="space-y-1 mb-2">
                  {subtasks.map(sub => (
                    <div key={sub.id} className="flex items-center gap-2 group">
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(sub)}
                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                          sub.completed
                            ? 'bg-green-500/20 border-green-500/50 text-green-400'
                            : 'border-zinc-600 hover:border-zinc-400'
                        }`}
                      >
                        {sub.completed && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-xs flex-1 ${sub.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                        {sub.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(sub.id)}
                        className="p-0.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Agregar subtarea..."
                  className="flex-1 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Activity */}
          {task?.id && (
            <div>
              <button
                type="button"
                onClick={() => setShowActivity(!showActivity)}
                className="text-xs text-zinc-400 hover:text-zinc-200 mb-2 flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showActivity ? "M19 14l-7 7m0 0l-7-7m7 7V3" : "M5 10l7-7m0 0l7 7m-7-7v18"} />
                </svg>
                Historial
              </button>
              {showActivity && (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 max-h-48 overflow-y-auto">
                  <ActivityTimeline taskId={task.id} />
                </div>
              )}
            </div>
          )}
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
