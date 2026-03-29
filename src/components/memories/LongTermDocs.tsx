'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LongTermDoc } from '@/lib/types';
import MarkdownContent from './MarkdownContent';
import MarkdownEditor from '../MarkdownEditor';

export default function LongTermDocs() {
  const [docs, setDocs] = useState<LongTermDoc[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const fetchDocs = useCallback(async () => {
    const res = await fetch('/api/long-term-docs');
    const data = await res.json();
    setDocs(data);
    if (data.length > 0 && !activeSlug) {
      setActiveSlug(data[0].slug);
    }
  }, [activeSlug]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const activeDoc = docs.find(d => d.slug === activeSlug);

  const handleEdit = () => {
    if (!activeDoc) return;
    setEditContent(activeDoc.content);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!activeSlug) return;
    await fetch(`/api/long-term-docs/${activeSlug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    });
    setEditing(false);
    fetchDocs();
  };

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      {/* Doc tabs */}
      <div className="flex border-b border-zinc-800 overflow-x-auto">
        {docs.map(doc => (
          <button
            key={doc.slug}
            onClick={() => { setActiveSlug(doc.slug); setEditing(false); }}
            className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeSlug === doc.slug
                ? 'border-zinc-400 text-zinc-100 bg-zinc-800/50'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {doc.title}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeDoc && (
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-zinc-500">
              Ultima modificacion: {new Date(activeDoc.updated_at).toLocaleDateString('es-ES', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </span>
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-xs bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-50 font-medium transition-colors"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
              >
                Editar
              </button>
            )}
          </div>

          {editing ? (
            <MarkdownEditor
              value={editContent}
              onChange={setEditContent}
              rows={18}
            />
          ) : (
            <MarkdownContent content={activeDoc.content} />
          )}
        </div>
      )}
    </div>
  );
}
