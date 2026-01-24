-- Create skill_tags table
CREATE TABLE IF NOT EXISTS skill_tags (
    id UUID PRIMARY KEY,
    skill_category_id UUID NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    order_by INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_skill_tags_skill_category_id ON skill_tags(skill_category_id);
CREATE INDEX idx_skill_tags_deleted_at ON skill_tags(deleted_at);
CREATE INDEX idx_skill_tags_order_by ON skill_tags(order_by);
