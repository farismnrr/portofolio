# API Contract: Get Comments

Retrieve comments for a blog post.

- **URL**: `/v1/interactions/blog/:slug/comments`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Comments retrieved successfully",
  "data": {
    "comments": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "username": "...",
        "content": "...",
        "created_at": "..."
      }
    ]
  }
}
```

### 2. Error: Unauthorized
- **Status**: `401 Unauthorized`
- **Response**: See [common/errors.md#401-unauthorized](../../common/errors.md#401-unauthorized)

### 3. Error: Not Found
- **Status**: `404 Not Found`
- **Description**: Blog post not found.
- **Response**: See [common/errors.md#404-not-found](../../common/errors.md#404-not-found)

### 4. Error: Internal Server Error
- **Status**: `500 Internal Server Error`
- **Response**: See [common/errors.md#500-internal-server-error](../../common/errors.md#500-internal-server-error)
