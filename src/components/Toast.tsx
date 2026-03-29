'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

interface ToastItem {
  id: number;
  message: string;
  onUndo?: () => void;
}

interface ToastContextType {
  showToast: (message: string, onUndo?: () => void) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, onUndo?: () => void) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, onUndo }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleUndo = useCallback((toast: ToastItem) => {
    if (toast.onUndo) toast.onUndo();
    dismiss(toast.id);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl animate-[slideUp_0.2s_ease-out]"
          >
            <span className="text-xs text-zinc-200">{toast.message}</span>
            {toast.onUndo && (
              <button
                onClick={() => handleUndo(toast)}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
              >
                Deshacer
              </button>
            )}
            <button
              onClick={() => dismiss(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors ml-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
