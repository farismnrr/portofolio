-- Create work_achievements table
CREATE TABLE IF NOT EXISTS work_achievements (
    id UUID PRIMARY KEY,
    work_experience_id UUID NOT NULL REFERENCES work_experiences(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    order_by INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_work_achievements_work_experience_id ON work_achievements(work_experience_id);
CREATE INDEX idx_work_achievements_deleted_at ON work_achievements(deleted_at);
CREATE INDEX idx_work_achievements_order_by ON work_achievements(order_by);
