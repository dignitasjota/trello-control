export type Status = 'pendiente' | 'en_progreso' | 'revision' | 'terminado';
export type Priority = 'alta' | 'media' | 'baja';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  project: string;
  created_at: string;
  completed_at: string | null;
  due_date: string | null;
  tags: string;
  estimate: number | null;
  position: number;
  archived: number;
  subtasks?: Subtask[];
}

export const ESTIMATE_OPTIONS = [1, 2, 3, 5, 8, 13] as const;

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: number;
  position: number;
  created_at: string;
}

export const COLUMNS: { id: Status; label: string }[] = [
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'en_progreso', label: 'En Progreso' },
  { id: 'revision', label: 'Revision' },
  { id: 'terminado', label: 'Terminado' },
];

export const PRIORITY_COLORS: Record<Priority, string> = {
  alta: 'bg-red-500/20 text-red-400 border-red-500/30',
  media: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  baja: 'bg-green-500/20 text-green-400 border-green-500/30',
};

// Scheduled tasks
export type Frequency = 'unica' | 'diaria' | 'semanal' | 'mensual' | 'personalizada';

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  frequency: Frequency;
  cron_expression: string;
  scheduled_time: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduledExecution {
  id: string;
  task_id: string;
  executed_at: string;
  notes: string;
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  unica: 'Unica',
  diaria: 'Diaria',
  semanal: 'Semanal',
  mensual: 'Mensual',
  personalizada: 'Personalizada',
};

export const FREQUENCY_COLORS: Record<Frequency, string> = {
  unica: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  diaria: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  semanal: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  mensual: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  personalizada: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

// Projects
export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  archived: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  name: string;
  url: string;
  notes: string;
  created_at: string;
}

export interface ProjectWithStats extends Project {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  review_tasks: number;
  last_activity: string | null;
  days_inactive: number;
}

// Memories
export type MemoryCategory = 'conversacion' | 'decision' | 'insight' | 'nota';

export interface Memory {
  id: string;
  title: string;
  content: string;
  category: MemoryCategory;
  project: string;
  created_at: string;
  updated_at: string;
}

export interface LongTermDoc {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export const MEMORY_CATEGORIES: { id: MemoryCategory; label: string; color: string }[] = [
  { id: 'conversacion', label: 'Conversacion', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'decision', label: 'Decision', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'insight', label: 'Insight', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'nota', label: 'Nota', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
];

// Documents
export interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  project: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_DOC_CATEGORIES: { id: string; name: string; color: string }[] = [
  { id: 'planificacion', name: 'Planificacion', color: '#3b82f6' },
  { id: 'arquitectura', name: 'Arquitectura', color: '#8b5cf6' },
  { id: 'prd', name: 'PRD', color: '#f59e0b' },
  { id: 'newsletter', name: 'Newsletter', color: '#10b981' },
  { id: 'contenido', name: 'Contenido', color: '#ec4899' },
  { id: 'otro', name: 'Otro', color: '#71717a' },
];

// Activity/Audit log
export interface TaskActivity {
  id: string;
  task_id: string;
  action: 'created' | 'updated' | 'status_changed' | 'deleted' | 'subtask_added' | 'subtask_completed';
  field?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export const PROJECT_ICONS: { id: string; label: string; svg: string }[] = [
  { id: 'folder', label: 'Carpeta', svg: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { id: 'code', label: 'Codigo', svg: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { id: 'globe', label: 'Web', svg: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
  { id: 'server', label: 'Servidor', svg: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2' },
  { id: 'chart', label: 'Datos', svg: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'book', label: 'Docs', svg: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'rocket', label: 'Lanzamiento', svg: 'M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' },
  { id: 'star', label: 'Favorito', svg: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
];
