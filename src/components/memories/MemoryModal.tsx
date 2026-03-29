'use client';

import { useState, useEffect } from 'react';
import type { Memory, MemoryCategory } from '@/lib/types';
import MarkdownEditor from '../MarkdownEditor';

interface MemoryModalProps {
  memory: Partial<Memory> | null;
  onClose: () => void;
  onSave: (data: Partial<Memory>) => void;
}

export default function MemoryModal({ memory, onClose, onSave }: MemoryModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('nota');
  const [project, setProject] = useState('');

  useEffect(() => {
    if (memory) {
      setTitle(memory.title || '');
      setContent(memory.content || '');
      setCategory((memory.category as MemoryCategory) || 'nota');
      setProject(memory.project || '');
    }
  }, [memory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ ...memory, title, content, category, project });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg shadow-2xl"
      >
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">
          {memory?.id ? 'Editar memoria' : 'Nueva memoria'}
        </h2>

        <div className="space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          />

          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Contenido de la memoria"
            rows={8}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                <option value="conversacion">Conversacion</option>
                <option value="decision">Decision</option>
                <option value="insight">Insight</option>
                <option value="nota">Nota</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Proyecto (opcional)</label>
              <input
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="slug del proyecto"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
              />
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
            {memory?.id ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
