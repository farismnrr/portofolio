ALTER TABLE comments ADD COLUMN parent_id TEXT;
CREATE INDEX idx_comments_parent ON comments(parent_id);
