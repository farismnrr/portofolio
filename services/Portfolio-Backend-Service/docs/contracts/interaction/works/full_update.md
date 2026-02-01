# API Contract: Full Update Work

Update complete work/project content including title, description, images, etc.

- **URL**: `/v1/interactions/works/:id`
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
  "images": ["string (array, optional)"],
  "time": "string (optional)",
  "team": ["string (array, optional)"],
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
  "message": "Work updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated Project Title",
    "slug": "updated-project-slug",
    "description": "Updated description",
    "content": "Updated content...",
    "images": ["image1.jpg", "image2.jpg"],
    "time": "3 months",
    "team": ["John Doe", "Jane Smith"],
    "categories": ["Web Development", "Design"],
    "views_count": 150,
    "likes_count": 25,
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
  "error": "Work not found"
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
    "slug must be unique"
  ]
}
```
