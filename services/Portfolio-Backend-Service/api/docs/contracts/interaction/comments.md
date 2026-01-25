# API Contract: Comments

This document defines the API contract for managing user comments (stored in the `comments` table).

## Authentication
Every endpoint in this domain requires a valid JWT Access Token.
- **Header:** `Authorization: Bearer <access_token>`

---

## 1. Get Comments
Retrieves a list of comments for a specific work or blog post.

- **URL:** `/v1/interactions/:type/:slug/comments`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <access_token>` (Required)
  - `Accept: application/json`

### User Scenarios

#### Case 1: Successfully Retrieve Comments
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Comments retrieved successfully",
  "data": {
    "comments": [
      {
        "id": "uuid-1",
        "user_name": "John Doe",
        "content": "Excellent analysis!",
        "created_at": "2026-01-25T12:00:00Z"
      }
    ]
  }
}
```

#### Case 2: No Comments Found
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "No comments found",
  "data": {
    "comments": []
  }
}
```

#### Case 3: Unauthorized
- **Status:** `401 Unauthorized`
- **Response Body:**
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

#### Case 4: Target Post Not Found
- **Status:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Post with type 'blog' and slug 'unknown' not found"
}
```

#### Case 5: Bad Request (Invalid Type)
- **Status:** `400 Bad Request`
- **Response Body:**
```json
{
  "status": false,
  "message": "Invalid post type: only 'work' or 'blog' allowed"
}
```

#### Case 6: Internal Server Error
- **Status:** `500 Internal Server Error`
- **Response Body:**
```json
{
  "status": false,
  "message": "Internal server error"
}
```

---

## 2. Add Comment
Adds a new user comment to a post.

- **URL:** `/v1/interactions/:type/:slug/comment`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "user_name": "string (required) - Name of the commenter",
  "content": "string (required) - The comment content"
}
```

### User Scenarios

#### Case 1: Successfully Created
- **Status:** `201 Created`
- **Response Body:**
```json
{
  "status": true,
  "message": "Comment added successfully",
  "data": {
    "comment_id": "uuid-new"
  }
}
```

#### Case 2: Unauthorized
- **Status:** `401 Unauthorized`
- **Response Body:**
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

#### Case 3: Target Post Not Found
- **Status:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Target post not found"
}
```

#### Case 4: Validation Failed (Missing Required Fields)
- **Status:** `422 Unprocessable Entity`
- **Response Body:**
```json
{
  "status": false,
  "message": "Validation failed",
  "details": [
    {
      "field": "content",
      "message": "Comment content is required"
    }
  ]
}
```

#### Case 5: Bad Request (Comment Too Long)
- **Status:** `400 Bad Request`
- **Response Body:**
```json
{
  "status": false,
  "message": "Comment exceeds maximum length of 1000 characters"
}
```

#### Case 6: Internal Server Error
- **Status:** `500 Internal Server Error`
- **Response Body:**
```json
{
  "status": false,
  "message": "Internal server error"
}
```

---

## 3. Update Comment (Admin or Owner Only)
Updates the content of an existing comment.

- **URL:** `/v1/interactions/comments/:id`
- **Method:** `PATCH`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "content": "string (required) - The updated content"
}
```

### User Scenarios

#### Case 1: Successfully Updated
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Comment updated successfully",
  "data": {
    "comment_id": "uuid-1"
  }
}
```

#### Case 2: Unauthorized
- **Status:** `401 Unauthorized`
- **Response Body:**
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

#### Case 3: Forbidden (Not Owner or Admin)
- **Status:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": false,
  "message": "Forbidden: You cannot edit this comment"
}
```

#### Case 4: Comment ID Not Found
- **Status:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Comment not found"
}
```

#### Case 5: Validation Failed (Empty Content)
- **Status:** `422 Unprocessable Entity`
- **Response Body:**
```json
{
  "status": false,
  "message": "Validation failed",
  "details": [
    {
      "field": "content",
      "message": "Content cannot be empty"
    }
  ]
}
```

#### Case 6: Internal Server Error
- **Status:** `500 Internal Server Error`
- **Response Body:**
```json
{
  "status": false,
  "message": "Internal server error"
}
```

---

## 4. Delete Comment (Admin or Owner Only)
Permanently removes/Deletes a comment.

- **URL:** `/v1/interactions/comments/:id`
- **Method:** `DELETE`
- **Headers:**
  - `Authorization: Bearer <access_token>` (Required)

### User Scenarios

#### Case 1: Successfully Deleted
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Comment deleted successfully"
}
```

#### Case 2: Unauthorized
- **Status:** `401 Unauthorized`
- // Response Body:
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

#### Case 3: Forbidden
- **Status:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": false,
  "message": "Forbidden: Insufficient permissions"
}
```

#### Case 4: Comment ID Not Found
- **Status:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Comment not found"
}
```

#### Case 5: Internal Server Error
- **Status:** `500 Internal Server Error`
- **Response Body:**
```json
{
  "status": false,
  "message": "Internal server error"
}
```
