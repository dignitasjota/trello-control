'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';
import { useToast } from './Toast';

interface Settings {
  user_name: string;
  user_role: string;
  notifications_enabled: string;
  notifications_interval: string;
  default_priority: string;
  default_assignee: string;
  api_token_configured: string;
}

const ACCENT_COLORS = [
  { id: 'blue', color: '#3b82f6', label: 'Azul' },
  { id: 'purple', color: '#8b5cf6', label: 'Morado' },
  { id: 'green', color: '#10b981', label: 'Verde' },
  { id: 'amber', color: '#f59e0b', label: 'Ambar' },
  { id: 'rose', color: '#f43f5e', label: 'Rosa' },
  { id: 'cyan', color: '#06b6d4', label: 'Cyan' },
];

export default function SettingsView() {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<{ tasks: number; projects: number; memories: number; documents: number } | null>(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {});

    // Fetch stats
    Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
      fetch('/api/memories').then(r => r.json()),
      fetch('/api/documents').then(r => r.json()),
    ]).then(([tasks, projects, memories, documents]) => {
      setStats({
        tasks: tasks.length,
        projects: projects.length,
        memories: memories.length,
        documents: documents.length,
      });
    }).catch(() => {});
  }, []);

  const handleSave = async (updates: Partial<Settings>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      setSettings(data);
      showToast('Configuracion guardada');
    } catch {
      showToast('Error al guardar');
    }
    setSaving(false);
  };

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/backup');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `centro-control-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Backup descargado');
    } catch {
      showToast('Error al crear backup');
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/tasks/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tareas.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(`Tareas exportadas a ${format.toUpperCase()}`);
    } catch {
      showToast('Error al exportar');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const tasks = Array.isArray(data) ? data : data.tasks || [];
      const res = await fetch('/api/tasks/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasks),
      });
      const result = await res.json();
      showToast(`${result.imported} tareas importadas`);
    } catch {
      showToast('Error al importar');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!settings) {
    return <div className="text-zinc-500 text-sm py-20 text-center">Cargando configuracion...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Perfil */}
      <section className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50">
        <h2 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Perfil
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Nombre</label>
            <input
              value={settings.user_name}
              onChange={(e) => setSettings({ ...settings, user_name: e.target.value })}
              onBlur={() => handleSave({ user_name: settings.user_name })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Rol / Descripcion</label>
            <input
              value={settings.user_role}
              onChange={(e) => setSettings({ ...settings, user_role: e.target.value })}
              onBlur={() => handleSave({ user_role: settings.user_role })}
              placeholder="Ej: Desarrollador, PM, Estudiante..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>
      </section>

      {/* Apariencia */}
      <section className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50">
        <h2 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Apariencia
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-200">Tema</div>
              <div className="text-xs text-zinc-500">Alterna entre modo oscuro y claro</div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                theme === 'light' ? 'bg-blue-500' : 'bg-zinc-700'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-zinc-100 rounded-full transition-transform ${
                theme === 'light' ? 'left-6' : 'left-0.5'
              }`} />
            </button>
          </div>
          <div>
            <div className="text-sm text-zinc-200 mb-2">Color de acento</div>
            <div className="flex gap-2">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.id}
                  title={c.label}
                  onClick={() => {
                    document.documentElement.style.setProperty('--color-accent', c.color);
                    localStorage.setItem('accent_color', c.color);
                    showToast(`Acento: ${c.label}`);
                  }}
                  className="w-8 h-8 rounded-full border-2 border-zinc-700 hover:border-zinc-400 transition-colors"
                  style={{ backgroundColor: c.color }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notificaciones */}
      <section className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50">
        <h2 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notificaciones
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-200">Activar notificaciones</div>
              <div className="text-xs text-zinc-500">Campana con alertas de tareas vencidas y pendientes</div>
            </div>
            <button
              onClick={() => {
                const next = settings.notifications_enabled === 'true' ? 'false' : 'true';
                setSettings({ ...settings, notifications_enabled: next });
                handleSave({ notifications_enabled: next });
              }}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.notifications_enabled === 'true' ? 'bg-blue-500' : 'bg-zinc-700'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-zinc-100 rounded-full transition-transform ${
                settings.notifications_enabled === 'true' ? 'left-6' : 'left-0.5'
              }`} />
            </button>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Intervalo de verificacion (segundos)</label>
            <select
              value={settings.notifications_interval}
              onChange={(e) => {
                setSettings({ ...settings, notifications_interval: e.target.value });
                handleSave({ notifications_interval: e.target.value });
              }}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
            >
              <option value="30">30s</option>
              <option value="60">1 min</option>
              <option value="120">2 min</option>
              <option value="300">5 min</option>
            </select>
          </div>
        </div>
      </section>

      {/* Valores por defecto */}
      <section className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50">
        <h2 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Valores por defecto
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Prioridad por defecto</label>
            <select
              value={settings.default_priority}
              onChange={(e) => {
                setSettings({ ...settings, default_priority: e.target.value });
                handleSave({ default_priority: e.target.value });
              }}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Asignado por defecto</label>
            <select
              value={settings.default_assignee}
              onChange={(e) => {
                setSettings({ ...settings, default_assignee: e.target.value });
                handleSave({ default_assignee: e.target.value });
              }}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
            >
              <option value="">Sin asignar</option>
              <option value="yo">Yo</option>
              <option value="agente">Agente</option>
            </select>
          </div>
        </div>
      </section>

      {/* Datos */}
      <section className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50">
        <h2 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          Datos
        </h2>

        {stats && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-zinc-100">{stats.tasks}</div>
              <div className="text-[10px] text-zinc-500">Tareas</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-zinc-100">{stats.projects}</div>
              <div className="text-[10px] text-zinc-500">Proyectos</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-zinc-100">{stats.memories}</div>
              <div className="text-[10px] text-zinc-500">Memorias</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-zinc-100">{stats.documents}</div>
              <div className="text-[10px] text-zinc-500">Documentos</div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <div className="text-sm text-zinc-200 mb-2">Backup completo</div>
            <button
              onClick={handleBackup}
              className="px-4 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
            >
              Descargar backup (JSON)
            </button>
            <p className="text-[10px] text-zinc-500 mt-1">Incluye tareas, proyectos, memorias, documentos y configuracion</p>
          </div>

          <div className="border-t border-zinc-800 pt-3">
            <div className="text-sm text-zinc-200 mb-2">Exportar tareas</div>
            <div className="flex gap-2">
              <button onClick={() => handleExport('json')} className="px-3 py-1.5 text-xs bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 rounded-lg transition-colors">
                JSON
              </button>
              <button onClick={() => handleExport('csv')} className="px-3 py-1.5 text-xs bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 rounded-lg transition-colors">
                CSV
              </button>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-3">
            <div className="text-sm text-zinc-200 mb-2">Importar tareas</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 rounded-lg transition-colors"
            >
              Seleccionar archivo JSON
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
        </div>
      </section>

      {/* API */}
      <section className="border border-zinc-700 rounded-xl p-5 bg-zinc-900/50">
        <h2 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          API del agente
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${settings.api_token_configured === 'true' ? 'bg-green-500' : 'bg-amber-500'}`} />
            <span className="text-sm text-zinc-300">
              {settings.api_token_configured === 'true' ? 'Token API configurado' : 'Sin token API (acceso abierto)'}
            </span>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-400 space-y-2">
            <p>El token se configura via variable de entorno <code className="px-1 py-0.5 bg-zinc-700 rounded text-zinc-300">API_TOKEN</code></p>
            <div className="bg-zinc-800 rounded p-2 font-mono text-zinc-300">
              <p># docker-compose.yml</p>
              <p>environment:</p>
              <p>&nbsp;&nbsp;API_TOKEN: tu-token-secreto</p>
            </div>
            <p>El agente debe enviar el header:</p>
            <div className="bg-zinc-800 rounded p-2 font-mono text-zinc-300">
              Authorization: Bearer tu-token-secreto
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-3">
            <div className="text-sm text-zinc-200 mb-2">Endpoints disponibles</div>
            <div className="grid grid-cols-1 gap-1 text-xs font-mono text-zinc-400 max-h-40 overflow-y-auto">
              {[
                'GET /api/tasks',
                'POST /api/tasks',
                'GET /api/tasks/:id',
                'PATCH /api/tasks/:id',
                'DELETE /api/tasks/:id',
                'GET /api/agent-tasks',
                'GET /api/projects',
                'GET /api/memories/context',
                'POST /api/memories',
                'GET /api/documents',
                'POST /api/documents',
                'GET /api/notifications',
                'GET /api/settings',
              ].map(ep => (
                <div key={ep} className="px-2 py-1 bg-zinc-800/50 rounded">{ep}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {saving && (
        <div className="fixed bottom-6 left-6 text-xs text-zinc-500">Guardando...</div>
      )}
    </div>
  );
}
