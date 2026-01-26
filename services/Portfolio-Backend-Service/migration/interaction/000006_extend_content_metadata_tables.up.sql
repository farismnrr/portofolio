-- Add columns to works_metadata
ALTER TABLE works_metadata ADD COLUMN title VARCHAR(255);
ALTER TABLE works_metadata ADD COLUMN content TEXT;
ALTER TABLE works_metadata ADD COLUMN summary TEXT;
ALTER TABLE works_metadata ADD COLUMN project_name VARCHAR(255);
ALTER TABLE works_metadata ADD COLUMN images TEXT; -- Stored as JSON string
ALTER TABLE works_metadata ADD COLUMN link TEXT;
ALTER TABLE works_metadata ADD COLUMN repository TEXT;
ALTER TABLE works_metadata ADD COLUMN team TEXT; -- Stored as JSON string
ALTER TABLE works_metadata ADD COLUMN published_at TIMESTAMP;

-- Add columns to blogs_metadata
ALTER TABLE blogs_metadata ADD COLUMN title VARCHAR(255);
ALTER TABLE blogs_metadata ADD COLUMN content TEXT;
ALTER TABLE blogs_metadata ADD COLUMN summary TEXT;
ALTER TABLE blogs_metadata ADD COLUMN blog_title VARCHAR(255);
ALTER TABLE blogs_metadata ADD COLUMN images TEXT; -- Stored as JSON string
ALTER TABLE blogs_metadata ADD COLUMN source TEXT;
ALTER TABLE blogs_metadata ADD COLUMN published_at TIMESTAMP;
