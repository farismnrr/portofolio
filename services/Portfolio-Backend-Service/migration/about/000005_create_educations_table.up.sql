-- Create educations table
CREATE TABLE IF NOT EXISTS educations (
    id UUID PRIMARY KEY,
    about_id UUID NOT NULL REFERENCES abouts(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    period VARCHAR(100) NOT NULL,
    description TEXT,
    order_by INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_educations_about_id ON educations(about_id);
CREATE INDEX idx_educations_deleted_at ON educations(deleted_at);
CREATE INDEX idx_educations_order_by ON educations(order_by);
