-- Create social_links table
CREATE TABLE IF NOT EXISTS social_links (
    id UUID PRIMARY KEY,
    about_id UUID NOT NULL REFERENCES abouts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    link TEXT NOT NULL,
    icon VARCHAR(100),
    order_by INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_social_links_about_id ON social_links(about_id);
CREATE INDEX idx_social_links_deleted_at ON social_links(deleted_at);
CREATE INDEX idx_social_links_order_by ON social_links(order_by);
