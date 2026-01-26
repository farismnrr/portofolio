ALTER TABLE comments ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '';
CREATE INDEX idx_comments_email ON comments(email);
