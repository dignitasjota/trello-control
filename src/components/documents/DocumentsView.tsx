'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Document, DocumentCategory } from '@/lib/types';
import DocumentCard from './DocumentCard';
import DocumentModal from './DocumentModal';
import DocumentReader from './DocumentReader';
import ConfirmDialog from '../ConfirmDialog';

export default function DocumentsView() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at'>('updated_at');
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Modals
  const [modalDoc, setModalDoc] = useState<Partial<Document> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [readerDoc, setReaderDoc] = useState<Document | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/document-categories');
    const data = await res.json();
    setCategories(data);
  }, []);

  const fetchDocuments = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterCategory) params.set('category', filterCategory);
    if (filterProject) params.set('project', filterProject);
    params.set('sort', sortBy);

    const res = await fetch(`/api/documents?${params.toString()}`);
    const data = await res.json();
    setDocuments(data);
  }, [filterCategory, filterProject, sortBy]);

  const searchDocuments = useCallback(async (q: string) => {
    if (!q.trim()) {
      fetchDocuments();
      return;
    }
    const res = await fetch(`/api/documents/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setDocuments(data);
  }, [fetchDocuments]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!searchQuery) {
      fetchDocuments();
    }
  }, [fetchDocuments, searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchDocuments(value), 300);
  };

  const handleSave = async (data: Partial<Document>) => {
    if (data.id) {
      await fetch(`/api/documents/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    setModalOpen(false);
    setModalDoc(null);
    fetchDocuments();
  };

  const handleDeleteRequest = (id: string) => {
    const d = documents.find(doc => doc.id === id);
    setDeleteTarget(d ? { id: d.id, title: d.title } : null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/documents/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    fetchDocuments();
  };

  const handleEdit = (doc: Document) => {
    setReaderDoc(null);
    setModalDoc(doc);
    setModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 transition-colors ${viewMode === 'grid' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="Vista cuadricula"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1.5 transition-colors ${viewMode === 'list' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
              title="Vista lista"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <button
          onClick={() => { setModalDoc({}); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo documento
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar en documentos..."
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
        >
          <option value="">Todas las categorias</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Project filter */}
        <input
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          placeholder="Proyecto"
          className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 w-28"
        />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'updated_at' | 'created_at')}
          className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
        >
          <option value="updated_at">Ultima modificacion</option>
          <option value="created_at">Fecha de creacion</option>
        </select>

        {/* Clear */}
        {(filterCategory || filterProject || searchQuery) && (
          <button
            onClick={() => { setFilterCategory(''); setFilterProject(''); setSearchQuery(''); }}
            className="px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Documents grid/list */}
      {documents.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-sm">
          No hay documentos{searchQuery ? ` para "${searchQuery}"` : ''}. Crea el primero.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              categories={categories}
              onClick={() => setReaderDoc(doc)}
              onEdit={() => handleEdit(doc)}
              onDelete={() => handleDeleteRequest(doc.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              categories={categories}
              listMode
              onClick={() => setReaderDoc(doc)}
              onEdit={() => handleEdit(doc)}
              onDelete={() => handleDeleteRequest(doc.id)}
            />
          ))}
        </div>
      )}

      {/* Reader overlay */}
      {readerDoc && (
        <DocumentReader
          document={readerDoc}
          categories={categories}
          onClose={() => setReaderDoc(null)}
          onEdit={() => handleEdit(readerDoc)}
        />
      )}

      {/* Edit/Create modal */}
      {modalOpen && (
        <DocumentModal
          document={modalDoc}
          categories={categories}
          onClose={() => { setModalOpen(false); setModalDoc(null); }}
          onSave={handleSave}
          onCategoryCreated={fetchCategories}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar documento"
          message={`¿Estas seguro de eliminar "${deleteTarget.title}"? Esta accion no se puede deshacer.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
