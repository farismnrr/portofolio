-- Create skill_categories table
CREATE TABLE IF NOT EXISTS skill_categories (
    id UUID PRIMARY KEY,
    about_id UUID NOT NULL REFERENCES abouts(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_by INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_skill_categories_about_id ON skill_categories(about_id);
CREATE INDEX idx_skill_categories_deleted_at ON skill_categories(deleted_at);
CREATE INDEX idx_skill_categories_order_by ON skill_categories(order_by);
