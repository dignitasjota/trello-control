'use client';

import type { Document, DocumentCategory } from '@/lib/types';
import MarkdownContent from '../memories/MarkdownContent';

interface DocumentReaderProps {
  document: Document;
  categories: DocumentCategory[];
  onClose: () => void;
  onEdit: () => void;
}

function formatDateFull(d: string) {
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export default function DocumentReader({ document, categories, onClose, onEdit }: DocumentReaderProps) {
  const cat = categories.find(c => c.id === document.category);
  const catColor = cat?.color || '#71717a';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: catColor + '22', color: catColor, border: `1px solid ${catColor}44` }}
              >
                {cat?.name || document.category}
              </span>
              {document.project && (
                <span className="text-[10px] text-zinc-500">#{document.project}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mb-1">{document.title}</h2>
            <div className="flex gap-4 text-[10px] text-zinc-500">
              <span>Creado: {formatDateFull(document.created_at)}</span>
              <span>Modificado: {formatDateFull(document.updated_at)}</span>
            </div>
          </div>
          <div className="flex gap-2 ml-4 flex-shrink-0">
            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <MarkdownContent content={document.content} />
        </div>
      </div>
    </div>
  );
}
