'use client';

import { useState, useEffect } from 'react';
import type { Project } from '@/lib/types';
import { PROJECT_ICONS } from '@/lib/types';

interface ProjectModalProps {
  project: Partial<Project> | null;
  onClose: () => void;
  onSave: (data: Partial<Project>) => void;
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#f97316', '#6366f1', '#14b8a6',
];

export default function ProjectModal({ project, onClose, onSave }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('folder');

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setColor(project.color || '#3b82f6');
      setIcon(project.icon || 'folder');
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ ...project, name, description, color, icon });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl"
      >
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">
          {project?.id ? 'Editar proyecto' : 'Nuevo proyecto'}
        </h2>

        <div className="space-y-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del proyecto"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripcion (opcional)"
            rows={2}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
          />

          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Icono</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_ICONS.map(ic => (
                <button
                  key={ic.id}
                  type="button"
                  onClick={() => setIcon(ic.id)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border ${
                    icon === ic.id
                      ? 'border-zinc-400 bg-zinc-700'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                  }`}
                  title={ic.label}
                >
                  <svg className="w-4 h-4" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={ic.svg} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
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
            {project?.id ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
