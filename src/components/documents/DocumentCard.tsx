'use client';

import type { Document, DocumentCategory } from '@/lib/types';

interface DocumentCardProps {
  document: Document;
  categories: DocumentCategory[];
  listMode?: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function getPreview(content: string, maxLen = 120): string {
  const plain = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + '...' : plain;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DocumentCard({ document, categories, listMode, onClick, onEdit, onDelete }: DocumentCardProps) {
  const cat = categories.find(c => c.id === document.category);
  const catColor = cat?.color || '#71717a';

  if (listMode) {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-4 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors cursor-pointer group"
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: catColor }}
        />
        <span className="text-sm text-zinc-100 font-medium flex-1 truncate">{document.title}</span>
        <span className="text-[10px] text-zinc-500 flex-shrink-0">{cat?.name || document.category}</span>
        {document.project && (
          <span className="text-[10px] text-zinc-600 flex-shrink-0">#{document.project}</span>
        )}
        <span className="text-[10px] text-zinc-600 flex-shrink-0">{formatDate(document.updated_at)}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors cursor-pointer group p-4"
    >
      {/* Category badge + actions */}
      <div className="flex items-start justify-between mb-2">
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: catColor + '22', color: catColor, border: `1px solid ${catColor}44` }}
        >
          {cat?.name || document.category}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-zinc-100 mb-1.5 line-clamp-2">{document.title}</h3>

      {/* Preview */}
      <p className="text-[11px] text-zinc-500 mb-3 line-clamp-3 flex-1">{getPreview(document.content)}</p>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-zinc-600">
        <span>{formatDate(document.updated_at)}</span>
        {document.project && <span>#{document.project}</span>}
      </div>
    </div>
  );
}
