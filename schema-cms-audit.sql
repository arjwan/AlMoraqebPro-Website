CREATE TABLE IF NOT EXISTS cms_audit (
 id TEXT PRIMARY KEY,
 actor TEXT NOT NULL,
 method TEXT NOT NULL,
 path TEXT NOT NULL,
 status INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS cms_audit_actor_time ON cms_audit(actor,created_at);
