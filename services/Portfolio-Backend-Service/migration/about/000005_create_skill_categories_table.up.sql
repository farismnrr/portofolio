-- Create skill_categories table
CREATE TABLE IF NOT EXISTS skill_categories (
    id TEXT PRIMARY KEY,
    about_id TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_by INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (about_id) REFERENCES abouts(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_skill_categories_about_id ON skill_categories(about_id);
CREATE INDEX idx_skill_categories_deleted_at ON skill_categories(deleted_at);
CREATE INDEX idx_skill_categories_order_by ON skill_categories(order_by);
