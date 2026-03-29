'use client';

import { useState } from 'react';
import type { Memory, MemoryCategory } from '@/lib/types';
import { MEMORY_CATEGORIES } from '@/lib/types';
import MarkdownContent from './MarkdownContent';

interface DailyTimelineProps {
  memories: Memory[];
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
}

function groupByDate(memories: Memory[]): Record<string, Memory[]> {
  const groups: Record<string, Memory[]> = {};
  for (const m of memories) {
    const date = m.created_at.split(' ')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(m);
  }
  return groups;
}

export default function DailyTimeline({ memories, onEdit, onDelete }: DailyTimelineProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const groups = groupByDate(memories);
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  // Auto-expand today
  const today = new Date().toISOString().split('T')[0];
  if (!expandedDates.has(today) && groups[today]) {
    expandedDates.add(today);
  }

  const toggleDate = (date: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-zinc-500">Aun no hay memorias registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedDates.map(date => {
        const dayMemories = groups[date];
        const isExpanded = expandedDates.has(date);
        const isToday = date === today;

        const formatted = new Date(date + 'T00:00:00').toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        return (
          <div key={date} className="rounded-xl border border-zinc-800 overflow-hidden">
            <button
              onClick={() => toggleDate(date)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                isExpanded ? 'bg-zinc-800/50' : 'hover:bg-zinc-800/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-blue-400' : 'bg-zinc-600'}`} />
                <span className="text-sm font-medium text-zinc-200 capitalize">{formatted}</span>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">
                  {dayMemories.length}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="px-4 pb-3 space-y-2 border-t border-zinc-800">
                {dayMemories.map(memory => {
                  const cat = MEMORY_CATEGORIES.find(c => c.id === memory.category) || MEMORY_CATEGORIES[3];
                  const time = memory.created_at.split(' ')[1]?.slice(0, 5) || '';

                  return (
                    <div key={memory.id} className="group rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3 mt-2">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] text-zinc-500 shrink-0">{time}</span>
                          <h4 className="text-sm font-medium text-zinc-100 truncate">{memory.title}</h4>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => onEdit(memory)} className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button onClick={() => onDelete(memory.id)} className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-red-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${cat.color}`}>
                          {cat.label}
                        </span>
                        {memory.project && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400">
                            {memory.project}
                          </span>
                        )}
                      </div>

                      {memory.content && (
                        <div className="text-xs">
                          <MarkdownContent content={memory.content} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
