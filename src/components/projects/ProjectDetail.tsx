'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Task, ProjectWithStats, ProjectDocument, Status } from '@/lib/types';
import { COLUMNS, PRIORITY_COLORS } from '@/lib/types';
import ProjectIcon from './ProjectIcon';

interface ProjectDetailData extends ProjectWithStats {
  tasks: Task[];
  documents: ProjectDocument[];
}

interface ProjectDetailProps {
  slug: string;
}

export default function ProjectDetail({ slug }: ProjectDetailProps) {
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [showDocForm, setShowDocForm] = useState(false);

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${slug}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data);
    }
  }, [slug]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    await fetch(`/api/projects/${slug}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: docName, url: docUrl, notes: docNotes }),
    });
    setDocName('');
    setDocUrl('');
    setDocNotes('');
    setShowDocForm(false);
    fetchProject();
  };

  if (!project) {
    return <div className="text-zinc-500 text-center py-16">Cargando...</div>;
  }

  const progress = project.total_tasks > 0
    ? Math.round((project.completed_tasks / project.total_tasks) * 100)
    : 0;

  const tasksByStatus = (status: Status) =>
    project.tasks.filter(t => t.status === status).sort((a, b) => a.position - b.position);

  return (
    <div>
      {/* Back link + header */}
      <div className="mb-6">
        <Link href="/proyectos" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          &larr; Proyectos
        </Link>
        <div className="flex items-center gap-4 mt-3">
          <ProjectIcon icon={project.icon} color={project.color} size="lg" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-zinc-100">{project.name}</h2>
            {project.description && (
              <p className="text-sm text-zinc-400 mt-0.5">{project.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-zinc-100">{progress}%</div>
            <div className="text-xs text-zinc-500">{project.completed_tasks}/{project.total_tasks} tareas</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mt-4">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: project.color }}
          />
        </div>
      </div>

      {/* Tasks by column */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {COLUMNS.map(col => {
          const colTasks = tasksByStatus(col.id);
          return (
            <div key={col.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-300">{col.label}</h3>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              <div className="p-3 space-y-2 min-h-[100px]">
                {colTasks.length === 0 ? (
                  <p className="text-xs text-zinc-600 text-center py-4">Sin tareas</p>
                ) : (
                  colTasks.map(task => (
                    <div
                      key={task.id}
                      className={`rounded-lg border p-2.5 ${
                        task.status === 'revision'
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : 'border-zinc-700/50 bg-zinc-800/50'
                      }`}
                    >
                      <h4 className="text-xs font-medium text-zinc-200 leading-tight">{task.title}</h4>
                      {task.description && (
                        <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`text-[9px] px-1 py-0.5 rounded border font-medium ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.assignee && (
                          <span className="text-[9px] text-zinc-500 ml-auto">
                            {task.assignee === 'agente' ? 'Agente' : 'Yo'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Documents */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">Documentos</h3>
          <button
            onClick={() => setShowDocForm(!showDocForm)}
            className="p-1 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {showDocForm && (
          <form onSubmit={handleAddDoc} className="p-4 border-b border-zinc-800 space-y-2">
            <input
              autoFocus
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Nombre del documento"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
            />
            <input
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              placeholder="URL (opcional)"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
            />
            <textarea
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              placeholder="Notas (opcional)"
              rows={2}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowDocForm(false)} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200">
                Cancelar
              </button>
              <button type="submit" className="px-3 py-1.5 text-xs bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-50 font-medium">
                Agregar
              </button>
            </div>
          </form>
        )}

        <div className="p-4">
          {project.documents.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-4">Sin documentos asociados</p>
          ) : (
            <div className="space-y-2">
              {project.documents.map(doc => (
                <div key={doc.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-zinc-800 bg-zinc-800/30">
                  <svg className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200 truncate">{doc.name}</span>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-400 hover:text-blue-300 shrink-0"
                        >
                          Abrir
                        </a>
                      )}
                    </div>
                    {doc.notes && (
                      <p className="text-xs text-zinc-400 mt-0.5">{doc.notes}</p>
                    )}
                    <span className="text-[10px] text-zinc-600">
                      {new Date(doc.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
