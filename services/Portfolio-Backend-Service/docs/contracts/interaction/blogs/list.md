# API Contract: List Blogs

Retrieve all blog posts with pagination.

- **URL**: `/v1/interactions/blogs`
- **Method**: `GET`
- **Auth Required**: No

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10) |

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Blogs retrieved successfully",
  "data": {
    "blogs": [
      {
        "id": 1,
        "slug": "getting-started-with-nextjs",
        "title": "Getting Started with Next.js",
        "description": "A comprehensive guide to Next.js",
        "views": 250,
        "likes": 80,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42
    }
  }
}
```

### 2. Empty List
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Blogs retrieved successfully",
  "data": {
    "blogs": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0
    }
  }
}
```
