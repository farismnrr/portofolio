-- Create work_experiences table
CREATE TABLE IF NOT EXISTS work_experiences (
    id UUID PRIMARY KEY,
    about_id UUID NOT NULL REFERENCES abouts(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    timeframe VARCHAR(100) NOT NULL,
    order_by INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_work_experiences_about_id ON work_experiences(about_id);
CREATE INDEX idx_work_experiences_deleted_at ON work_experiences(deleted_at);
CREATE INDEX idx_work_experiences_order_by ON work_experiences(order_by);
