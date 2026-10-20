CREATE TABLE IF NOT EXISTS cms_media (
 key TEXT PRIMARY KEY,
 content_type TEXT NOT NULL CHECK(content_type IN ('image/jpeg','image/png','image/webp','image/gif')),
 base64 TEXT NOT NULL,
 size_bytes INTEGER NOT NULL CHECK(size_bytes>0 AND size_bytes<=524288),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS cms_media_created ON cms_media(created_at);
