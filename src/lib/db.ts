import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'kanban.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pendiente',
    priority TEXT NOT NULL DEFAULT 'media',
    assignee TEXT DEFAULT '',
    project TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    completed_at TEXT,
    due_date TEXT,
    tags TEXT DEFAULT '',
    estimate INTEGER,
    position INTEGER NOT NULL DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  )
`);

// Migrations: add columns if missing
const migrations = [
  'ALTER TABLE tasks ADD COLUMN due_date TEXT',
  "ALTER TABLE tasks ADD COLUMN tags TEXT DEFAULT ''",
  'ALTER TABLE tasks ADD COLUMN estimate INTEGER',
  'ALTER TABLE tasks ADD COLUMN archived INTEGER NOT NULL DEFAULT 0',
];
for (const sql of migrations) {
  try { db.exec(sql); } catch { /* column already exists */ }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    frequency TEXT NOT NULL DEFAULT 'diaria',
    cron_expression TEXT DEFAULT '',
    scheduled_time TEXT NOT NULL DEFAULT '09:00',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS scheduled_executions (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    executed_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    notes TEXT DEFAULT '',
    FOREIGN KEY (task_id) REFERENCES scheduled_tasks(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    color TEXT NOT NULL DEFAULT '#3b82f6',
    icon TEXT NOT NULL DEFAULT 'folder',
    archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS project_documents (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'nota',
    project TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS long_term_docs (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'otro',
    project TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS document_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#71717a'
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  )
`);

// Seed default settings if empty
const settingsCount = db.prepare('SELECT COUNT(*) as c FROM settings').get() as { c: number };
if (settingsCount.c === 0) {
  const defaults = [
    ['user_name', 'Usuario'],
    ['user_role', ''],
    ['notifications_enabled', 'true'],
    ['notifications_interval', '60'],
    ['default_priority', 'media'],
    ['default_assignee', ''],
  ];
  const ins = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const [k, v] of defaults) ins.run(k, v);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS task_activity (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    action TEXT NOT NULL,
    field TEXT,
    old_value TEXT,
    new_value TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  )
`);

// Seed default document categories if empty
const catCount = db.prepare('SELECT COUNT(*) as c FROM document_categories').get() as { c: number };
if (catCount.c === 0) {
  const defaultCats = [
    { id: 'planificacion', name: 'Planificacion', color: '#3b82f6' },
    { id: 'arquitectura', name: 'Arquitectura', color: '#8b5cf6' },
    { id: 'prd', name: 'PRD', color: '#f59e0b' },
    { id: 'newsletter', name: 'Newsletter', color: '#10b981' },
    { id: 'contenido', name: 'Contenido', color: '#ec4899' },
    { id: 'otro', name: 'Otro', color: '#71717a' },
  ];
  const insertCat = db.prepare('INSERT OR IGNORE INTO document_categories (id, name, color) VALUES (?, ?, ?)');
  for (const cat of defaultCats) {
    insertCat.run(cat.id, cat.name, cat.color);
  }
}

// Seed default long-term docs if empty
const docCount = db.prepare('SELECT COUNT(*) as c FROM long_term_docs').get() as { c: number };
if (docCount.c === 0) {
  const defaults = [
    { slug: 'flujos-de-trabajo', title: 'Flujos de Trabajo', content: '# Flujos de Trabajo\n\nDocumenta aqui tus procesos y flujos de trabajo recurrentes.\n' },
    { slug: 'objetivos', title: 'Objetivos', content: '# Objetivos\n\nDefine tus objetivos a corto y largo plazo.\n' },
    { slug: 'perfil', title: 'Perfil', content: '# Perfil\n\nInformacion sobre ti, tus preferencias y contexto relevante para el agente.\n' },
    { slug: 'reglas-del-agente', title: 'Reglas del Agente', content: '# Reglas del Agente\n\nInstrucciones y reglas que el agente debe seguir.\n' },
  ];
  const insert = db.prepare('INSERT OR IGNORE INTO long_term_docs (id, slug, title, content) VALUES (?, ?, ?, ?)');
  for (const doc of defaults) {
    insert.run(doc.slug, doc.slug, doc.title, doc.content);
  }
}

export default db;
