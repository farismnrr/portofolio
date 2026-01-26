-- Create abouts table with UUID primary key
CREATE TABLE IF NOT EXISTS abouts (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create index on deleted_at for soft delete queries
CREATE INDEX idx_abouts_deleted_at ON abouts(deleted_at);
