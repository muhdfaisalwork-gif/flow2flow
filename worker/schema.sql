-- Shadow Flow Cloudflare D1 Database Schema
-- Serverless edge relational SQLite database

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  display_name TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  nodes TEXT NOT NULL DEFAULT '[]',
  edges TEXT NOT NULL DEFAULT '[]',
  settings TEXT NOT NULL DEFAULT '{}',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_updated_at ON workflows(updated_at DESC);

CREATE TABLE IF NOT EXISTS workflow_versions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  nodes TEXT NOT NULL DEFAULT '[]',
  edges TEXT NOT NULL DEFAULT '[]',
  settings TEXT NOT NULL DEFAULT '{}',
  created_by TEXT NOT NULL,
  change_summary TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_workflow_versions_wf_id ON workflow_versions(workflow_id);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  started_at TEXT NOT NULL,
  finished_at TEXT,
  error_log TEXT,
  logs TEXT DEFAULT '[]',
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_wf_id ON workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_started_at ON workflow_runs(started_at DESC);

CREATE TABLE IF NOT EXISTS user_credentials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  name TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON user_credentials(user_id);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'max'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  request_date TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, request_date)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, request_date);

CREATE TABLE IF NOT EXISTS user_tfa (
  user_id TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0,
  secret TEXT NOT NULL,
  backup_codes TEXT NOT NULL DEFAULT '[]',
  preferred_method TEXT NOT NULL DEFAULT 'totp',
  email_otp TEXT,
  email_otp_expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_tfa_user_id ON user_tfa(user_id);

CREATE TABLE IF NOT EXISTS user_graph_memory (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  label TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_graph_memory_user_id ON user_graph_memory(user_id);

CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'AI Automation',
  published_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  reading_time_minutes INTEGER NOT NULL DEFAULT 6,
  author TEXT NOT NULL DEFAULT 'Faisal Muhammad',
  author_role TEXT NOT NULL DEFAULT 'Chief AI Architect',
  target_keyword TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  schema_json_ld TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at DESC);


