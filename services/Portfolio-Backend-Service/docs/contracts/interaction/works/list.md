# API Contract: List Works

Retrieve all work/project records with pagination.

- **URL**: `/v1/interactions/works`
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
  "message": "Works retrieved successfully",
  "data": {
    "works": [
      {
        "id": 1,
        "slug": "portfolio-website",
        "title": "Portfolio Website",
        "description": "Personal portfolio built with Next.js",
        "views": 120,
        "likes": 45,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25
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
  "message": "Works retrieved successfully",
  "data": {
    "works": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0
    }
  }
}
```
