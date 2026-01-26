-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_type VARCHAR(50) NOT NULL, -- 'work' or 'blog'
    post_slug VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_type, post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);
