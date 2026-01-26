-- Create educations table
CREATE TABLE IF NOT EXISTS educations (
    id TEXT PRIMARY KEY,
    about_id TEXT NOT NULL,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    period VARCHAR(100) NOT NULL,
    description TEXT,
    order_by INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (about_id) REFERENCES abouts(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_educations_about_id ON educations(about_id);
CREATE INDEX idx_educations_deleted_at ON educations(deleted_at);
CREATE INDEX idx_educations_order_by ON educations(order_by);
