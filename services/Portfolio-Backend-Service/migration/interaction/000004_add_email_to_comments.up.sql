ALTER TABLE comments ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_comments_email ON comments(email);
