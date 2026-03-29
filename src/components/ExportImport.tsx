'use client';

import { useRef } from 'react';
import { useToast } from './Toast';

interface ExportImportProps {
  onImportComplete?: () => void;
}

export default function ExportImport({ onImportComplete }: ExportImportProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/tasks/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tareas.${format === 'json' ? 'json' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`Tareas exportadas a ${format.toUpperCase()}`);
    } catch (error) {
      showToast('Error al exportar tareas');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const tasks = Array.isArray(data) ? data : data.tasks || [];

      const response = await fetch('/api/tasks/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasks),
      });

      if (!response.ok) throw new Error('Import failed');

      const result = await response.json();
      showToast(`${result.imported} tareas importadas`);
      onImportComplete?.();
    } catch (error) {
      showToast('Error al importar tareas');
      console.error(error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('json')}
        className="px-3 py-1.5 text-xs bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
        title="Exportar a JSON"
      >
        📥 JSON
      </button>
      <button
        onClick={() => handleExport('csv')}
        className="px-3 py-1.5 text-xs bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
        title="Exportar a CSV"
      >
        📥 CSV
      </button>
      <button
        onClick={handleImportClick}
        className="px-3 py-1.5 text-xs bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 rounded-lg transition-colors"
        title="Importar desde archivo"
      >
        📤 Importar
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
