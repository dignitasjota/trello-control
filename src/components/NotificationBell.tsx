'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'overdue' | 'due_soon' | 'review' | 'scheduled';
  title: string;
  message: string;
  task_id?: string;
  priority?: string;
}

const TYPE_STYLES: Record<string, { dot: string; text: string }> = {
  overdue: { dot: 'bg-red-400', text: 'text-red-400' },
  due_soon: { dot: 'bg-amber-400', text: 'text-amber-400' },
  review: { dot: 'bg-amber-400', text: 'text-amber-400' },
  scheduled: { dot: 'bg-blue-400', text: 'text-blue-400' },
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => {
      fetch('/api/notifications')
        .then(r => r.json())
        .then(setNotifications)
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const count = notifications.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-100">
              Notificaciones {count > 0 && <span className="text-zinc-500 font-normal">({count})</span>}
            </h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-zinc-500">
                Sin notificaciones
              </div>
            ) : (
              notifications.map(n => {
                const style = TYPE_STYLES[n.type] || TYPE_STYLES.scheduled;
                return (
                  <Link
                    key={n.id}
                    href="/kanban"
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 last:border-0"
                  >
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-200 truncate">{n.title}</p>
                      <p className={`text-[10px] mt-0.5 ${style.text}`}>{n.message}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
