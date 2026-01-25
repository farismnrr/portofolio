-- Create blogs_metadata table
CREATE TABLE IF NOT EXISTS blogs_metadata (
    id TEXT PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    views_count INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME
);

-- Create indices
CREATE INDEX idx_blogs_metadata_slug ON blogs_metadata(slug);
CREATE INDEX idx_blogs_metadata_deleted_at ON blogs_metadata(deleted_at);
