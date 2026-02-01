# API Contract: Create Work

Create a new work/project entry.

- **URL**: `/v1/interactions/works`
- **Method**: `POST`
- **Auth Required**: Yes (Admin only)

## Request Body

```json
{
  "slug": "portfolio-website",
  "title": "Portfolio Website",
  "description": "Personal portfolio built with Next.js",
  "content": "Full project description...",
  "tags": ["nextjs", "typescript", "tailwind"]
}
```

## Scenarios

### 1. Success
- **Status**: `201 Created`
- **Response**:
```json
{
  "status": true,
  "message": "Work created successfully",
  "data": {
    "work": {
      "id": 1,
      "slug": "portfolio-website",
      "title": "Portfolio Website",
      "description": "Personal portfolio built with Next.js",
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
      "field": "slug",
      "message": "slug is required"
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
  "message": "Work with this slug already exists"
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
