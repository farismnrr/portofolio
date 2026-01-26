CREATE TABLE IF NOT EXISTS seo_metadata (
    id TEXT PRIMARY KEY,
    post_type VARCHAR(50) NOT NULL, -- 'work' or 'blog'
    post_id TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    keywords TEXT,
    og_image TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seo_metadata_post ON seo_metadata(post_type, post_id);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_deleted_at ON seo_metadata(deleted_at);
