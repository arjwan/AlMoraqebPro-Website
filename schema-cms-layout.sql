-- Apply only missing columns after checking PRAGMA table_info(cms_posts).
ALTER TABLE cms_posts ADD COLUMN section TEXT NOT NULL DEFAULT 'news';
ALTER TABLE cms_posts ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cms_posts ADD COLUMN image_width INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cms_posts ADD COLUMN image_height INTEGER NOT NULL DEFAULT 280;
ALTER TABLE cms_posts ADD COLUMN image_fit TEXT NOT NULL DEFAULT 'cover';
ALTER TABLE cms_posts ADD COLUMN image_align TEXT NOT NULL DEFAULT 'center';
ALTER TABLE cms_posts ADD COLUMN card_width TEXT NOT NULL DEFAULT 'auto';
