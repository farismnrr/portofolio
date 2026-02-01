# API Contract: Create Comment

Post a new comment on a blog post.

- **URL**: `/v1/interactions/blog/:slug/comments`
- **Method**: `POST`
- **Auth Required**: No (Public)

## Request Body
```json
{
  "post_type": "work|blog (required)",
  "post_slug": "string (required)",
  "username": "string (required)",
  "email": "string (required, valid email)",
  "content": "string (required)",
  "parent_id": "string (optional, for replies)"
}
```

## Scenarios

### 1. Created
- **Status**: `201 Created`
- **Response**:
```json
{
  "status": true,
  "message": "Comment created successfully",
  "data": {
    "comment_id": "uuid"
  }
}
```

### 2. Error: Bad Request
- **Status**: `400 Bad Request`
- **Response**: See [common/errors.md#400-bad-request](../../common/errors.md#400-bad-request)

### 3. Error: Unauthorized
- **Status**: `401 Unauthorized`
- **Response**: See [common/errors.md#401-unauthorized](../../common/errors.md#401-unauthorized)

### 4. Error: Not Found
- **Status**: `404 Not Found`
- **Description**: Blog post not found.
- **Response**: See [common/errors.md#404-not-found](../../common/errors.md#404-not-found)

### 5. Error: Unsupported Media Type
- **Status**: `415 Unsupported Media Type`
- **Response**: See [common/errors.md#415-unsupported-media-type](../../common/errors.md#415-unsupported-media-type)

### 6. Error: Validation Failed
- **Status**: `422 Unprocessable Entity`
- **Response**: See [common/errors.md#422-unprocessable-entity](../../common/errors.md#422-unprocessable-entity)

### 7. Error: Internal Server Error
- **Status**: `500 Internal Server Error`
- **Response**: See [common/errors.md#500-internal-server-error](../../common/errors.md#500-internal-server-error)
