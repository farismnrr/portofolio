# API Contract: Full Update Blog

Update complete blog post content including title, description, body, etc.

- **URL**: `/v1/interactions/blogs/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Bearer Token)
- **Required Role**: `admin`

## Request Body
```json
{
  "title": "string (required)",
  "slug": "string (required)",
  "description": "string (required)",
  "content": "string (required)",
  "author": "string (required)",
  "date": "string (ISO 8601, required)",
  "images": ["string (array, optional)"],
  "categories": ["string (array, optional)"],
  "metadata": {
    "title": "string (optional)",
    "description": "string (optional)",
    "og_image": "string (optional)"
  }
}
```

## Scenarios

### 1. Success
**Status**: `200 OK`

**Response**:
```json
{
  "message": "Blog updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated Blog Title",
    "slug": "updated-blog-slug",
    "description": "Updated description",
    "content": "Updated content...",
    "author": "John Doe",
    "date": "2026-02-01",
    "images": ["image1.jpg", "image2.jpg"],
    "categories": ["Technology", "Tutorial"],
    "views_count": 250,
    "likes_count": 45,
    "updated_at": "2026-02-01T10:30:00Z"
  }
}
```

### 2. Unauthorized
**Status**: `401 Unauthorized`

**Response**:
```json
{
  "error": "Unauthorized access"
}
```

### 3. Forbidden (Non-Admin)
**Status**: `403 Forbidden`

**Response**:
```json
{
  "error": "Admin access required"
}
```

### 4. Not Found
**Status**: `404 Not Found`

**Response**:
```json
{
  "error": "Blog not found"
}
```

### 5. Validation Error
**Status**: `400 Bad Request`

**Response**:
```json
{
  "error": "Validation failed",
  "details": [
    "title is required",
    "slug must be unique",
    "date must be valid ISO 8601 format"
  ]
}
```
