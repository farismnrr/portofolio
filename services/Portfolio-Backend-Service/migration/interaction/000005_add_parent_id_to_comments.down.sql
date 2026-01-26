DROP INDEX IF EXISTS idx_comments_parent;
ALTER TABLE comments DROP COLUMN parent_id;
