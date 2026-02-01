# API Contract: Create Blog

Create a new blog post.

- **URL**: `/v1/interactions/blogs`
- **Method**: `POST`
- **Auth Required**: Yes (Admin only)

## Request Body

```json
{
  "slug": "getting-started-with-nextjs",
  "title": "Getting Started with Next.js",
  "description": "A comprehensive guide to Next.js",
  "content": "Full blog post content...",
  "tags": ["nextjs", "react", "javascript"]
}
```

## Scenarios

### 1. Success
- **Status**: `201 Created`
- **Response**:
```json
{
  "status": true,
  "message": "Blog created successfully",
  "data": {
    "blog": {
      "id": 1,
      "slug": "getting-started-with-nextjs",
      "title": "Getting Started with Next.js",
      "description": "A comprehensive guide to Next.js",
      "views": 0,
      "likes": 0,
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 2. Validation Error
- **Status**: `422 Unprocessable Entity`
- **Response**:
```json
{
  "status": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "title is required"
    }
  ]
}
```

### 3. Duplicate Slug
- **Status**: `409 Conflict`
- **Response**:
```json
{
  "status": false,
  "message": "Blog with this slug already exists"
}
```

### 4. Unauthorized
- **Status**: `401 Unauthorized`
- **Response**:
```json
{
  "status": false,
  "message": "Authentication required"
}
```
