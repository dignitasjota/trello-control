'use client';

import { useState, useEffect } from 'react';
import type { Document, DocumentCategory } from '@/lib/types';
import MarkdownEditor from '../MarkdownEditor';

interface DocumentModalProps {
  document: Partial<Document> | null;
  categories: DocumentCategory[];
  onClose: () => void;
  onSave: (data: Partial<Document>) => void;
  onCategoryCreated: () => void;
}

export default function DocumentModal({ document, categories, onClose, onSave, onCategoryCreated }: DocumentModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('otro');
  const [project, setProject] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);

  useEffect(() => {
    if (document) {
      setTitle(document.title || '');
      setContent(document.content || '');
      setCategory(document.category || 'otro');
      setProject(document.project || '');
    }
  }, [document]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ ...document, title, content, category, project });
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const res = await fetch('/api/document-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory }),
    });
    if (res.ok) {
      const cat = await res.json();
      setCategory(cat.id);
      setNewCategory('');
      setShowNewCat(false);
      onCategoryCreated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col"
      >
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">
          {document?.id ? 'Editar documento' : 'Nuevo documento'}
        </h2>

        <div className="space-y-3 flex-1 overflow-y-auto">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo del documento"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          />

          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Contenido del documento"
            rows={14}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Categoria</label>
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCat(!showNewCat)}
                  className="px-2 py-1 text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Agregar categoria"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              {showNewCat && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nueva categoria"
                    className="flex-1 px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-2 py-1 text-xs bg-zinc-700 text-zinc-200 rounded-lg hover:bg-zinc-600 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              )}
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
            {document?.id ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
