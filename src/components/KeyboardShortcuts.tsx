'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;

      // Escape always works — close modals handled by each component, but also close help
      if (e.key === 'Escape') {
        if (showHelp) {
          setShowHelp(false);
          e.preventDefault();
        }
        return;
      }

      // Don't intercept when typing in inputs
      if (isInput) return;

      // ? = show help
      if (e.key === '?') {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // Navigation shortcuts: g then letter
      if (e.key === '1') { router.push('/'); return; }
      if (e.key === '2') { router.push('/kanban'); return; }
      if (e.key === '3') { router.push('/calendario'); return; }
      if (e.key === '4') { router.push('/proyectos'); return; }
      if (e.key === '5') { router.push('/memorias'); return; }
      if (e.key === '6') { router.push('/documentos'); return; }

      // / = focus search (if on kanban or docs/memories page)
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router, pathname, showHelp]);

  if (!showHelp) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setShowHelp(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm shadow-2xl"
      >
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Atajos de teclado</h2>
        <div className="space-y-2">
          <ShortcutRow keys="?" desc="Mostrar/ocultar esta ayuda" />
          <ShortcutRow keys="Esc" desc="Cerrar modal o dialogo" />
          <ShortcutRow keys="/" desc="Enfocar busqueda" />
          <div className="border-t border-zinc-800 my-3" />
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Navegacion</p>
          <ShortcutRow keys="1" desc="Inicio (Dashboard)" />
          <ShortcutRow keys="2" desc="Kanban" />
          <ShortcutRow keys="3" desc="Calendario" />
          <ShortcutRow keys="4" desc="Proyectos" />
          <ShortcutRow keys="5" desc="Memorias" />
          <ShortcutRow keys="6" desc="Documentos" />
        </div>
        <div className="mt-5 text-right">
          <button
            onClick={() => setShowHelp(false)}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-400">{desc}</span>
      <kbd className="px-2 py-0.5 text-[11px] font-mono bg-zinc-800 border border-zinc-700 rounded text-zinc-300">
        {keys}
      </kbd>
    </div>
  );
}
