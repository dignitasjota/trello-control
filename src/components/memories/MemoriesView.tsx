'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Memory, MemoryCategory } from '@/lib/types';
import { MEMORY_CATEGORIES } from '@/lib/types';
import DailyTimeline from './DailyTimeline';
import LongTermDocs from './LongTermDocs';
import MemoryModal from './MemoryModal';
import ConfirmDialog from '../ConfirmDialog';

type Tab = 'diarias' | 'largo-plazo';

export default function MemoriesView() {
  const [tab, setTab] = useState<Tab>('diarias');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [modalMemory, setModalMemory] = useState<Partial<Memory> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterProject, setFilterProject] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchMemories = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterCategory) params.set('category', filterCategory);
    if (filterProject) params.set('project', filterProject);
    if (filterFrom) params.set('from', filterFrom);
    if (filterTo) params.set('to', filterTo);

    const res = await fetch(`/api/memories?${params.toString()}`);
    const data = await res.json();
    setMemories(data);
  }, [filterCategory, filterProject, filterFrom, filterTo]);

  const searchMemories = useCallback(async (q: string) => {
    if (!q.trim()) {
      fetchMemories();
      return;
    }
    const res = await fetch(`/api/memories/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setMemories(data);
  }, [fetchMemories]);

  useEffect(() => {
    if (!searchQuery) {
      fetchMemories();
    }
  }, [fetchMemories, searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchMemories(value), 300);
  };

  const handleSave = async (data: Partial<Memory>) => {
    if (data.id) {
      await fetch(`/api/memories/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    setModalOpen(false);
    setModalMemory(null);
    fetchMemories();
  };

  const handleDeleteRequest = (id: string) => {
    const m = memories.find(mem => mem.id === id);
    setDeleteTarget(m ? { id: m.id, title: m.title } : null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/memories/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    fetchMemories();
  };

  return (
    <div>
      {/* Tab bar + actions */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
          <button
            onClick={() => setTab('diarias')}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              tab === 'diarias' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Memorias Diarias
          </button>
          <button
            onClick={() => setTab('largo-plazo')}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              tab === 'largo-plazo' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Memoria a Largo Plazo
          </button>
        </div>

        {tab === 'diarias' && (
          <button
            onClick={() => { setModalMemory({}); setModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva memoria
          </button>
        )}
      </div>

      {tab === 'diarias' && (
        <>
          {/* Filters bar */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar en memorias..."
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
              {MEMORY_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            {/* Project filter */}
            <input
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              placeholder="Proyecto"
              className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 w-28"
            />

            {/* Date range */}
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
            />
            <span className="text-xs text-zinc-500">a</span>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
            />

            {/* Clear filters */}
            {(filterCategory || filterProject || filterFrom || filterTo || searchQuery) && (
              <button
                onClick={() => { setFilterCategory(''); setFilterProject(''); setFilterFrom(''); setFilterTo(''); setSearchQuery(''); }}
                className="px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>

          <DailyTimeline
            memories={memories}
            onEdit={(m) => { setModalMemory(m); setModalOpen(true); }}
            onDelete={handleDeleteRequest}
          />
        </>
      )}

      {tab === 'largo-plazo' && <LongTermDocs />}

      {modalOpen && (
        <MemoryModal
          memory={modalMemory}
          onClose={() => { setModalOpen(false); setModalMemory(null); }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar memoria"
          message={`¿Estas seguro de eliminar "${deleteTarget.title}"? Esta accion no se puede deshacer.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
