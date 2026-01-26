-- Create works_metadata table
CREATE TABLE IF NOT EXISTS works_metadata (
    id TEXT PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    views_count INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_works_metadata_slug ON works_metadata(slug);
CREATE INDEX IF NOT EXISTS idx_works_metadata_deleted_at ON works_metadata(deleted_at);
