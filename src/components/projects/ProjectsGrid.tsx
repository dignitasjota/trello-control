'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProjectWithStats } from '@/lib/types';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

export default function ProjectsGrid() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [modalProject, setModalProject] = useState<Partial<ProjectWithStats> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    const res = await fetch(`/api/projects?archived=${showArchived}`);
    const data = await res.json();
    setProjects(data);
  }, [showArchived]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSave = async (data: Partial<ProjectWithStats>) => {
    if (data.slug) {
      await fetch(`/api/projects/${data.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    setModalOpen(false);
    setModalProject(null);
    fetchProjects();
  };

  const handleArchive = async (slug: string) => {
    const project = projects.find(p => p.slug === slug);
    if (!project) return;
    await fetch(`/api/projects/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived: !project.archived }),
    });
    fetchProjects();
  };

  const activeProjects = projects.filter(p => !p.archived);
  const archivedProjects = projects.filter(p => p.archived);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-zinc-100">
            Proyectos
          </h2>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
            {activeProjects.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showArchived
                ? 'border-zinc-600 bg-zinc-800 text-zinc-300'
                : 'border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {showArchived ? 'Ocultar archivados' : 'Ver archivados'}
          </button>
          <button
            onClick={() => { setModalProject({}); setModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo proyecto
          </button>
        </div>
      </div>

      {/* Active projects */}
      {activeProjects.length === 0 && !showArchived ? (
        <div className="text-center py-16">
          <p className="text-sm text-zinc-500 mb-3">Aun no tienes proyectos</p>
          <button
            onClick={() => { setModalProject({}); setModalOpen(true); }}
            className="px-4 py-2 text-sm bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Crear primer proyecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => { setModalProject(p); setModalOpen(true); }}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {/* Archived projects */}
      {showArchived && archivedProjects.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-zinc-500 mb-3">
            Archivados ({archivedProjects.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => { setModalProject(p); setModalOpen(true); }}
                onArchive={handleArchive}
              />
            ))}
          </div>
        </div>
      )}

      {modalOpen && (
        <ProjectModal
          project={modalProject}
          onClose={() => { setModalOpen(false); setModalProject(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
