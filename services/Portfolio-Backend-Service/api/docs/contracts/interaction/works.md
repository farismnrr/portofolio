# API Contract: Work Interactions (Works Metadata)

This document defines the API contract for managing work metadata (stored in the `works_metadata` table).

## Authentication
Every endpoint in this domain requires a valid JWT Access Token.
- **Header:** `Authorization: Bearer <access_token>`

---

## 1. Get Work Interactions
Retrieves view and like counts for a specific work post.

- **URL:** `/v1/interactions/work/:slug`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <access_token>` (Required)
  - `Accept: application/json`

### User Scenarios

#### Case 1: Successfully Retrieve Data
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Work interactions retrieved successfully",
  "data": {
    "work": {
      "id": "uuid-1",
      "slug": "my-awesome-project",
      "views_count": 150,
      "likes_count": 25
    }
  }
}
```

#### Case 2: Unauthorized (Missing or Invalid Token)
- **Status:** `401 Unauthorized`
- **Response Body:**
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

#### Case 3: Work Slug Not Found
- **Status:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Work with slug 'non-existent' not found"
}
```

#### Case 4: Internal Server Error
- **Status:** `500 Internal Server Error`
- **Response Body:**
```json
{
  "status": false,
  "message": "Internal server error"
}
```

---

## 2. Record Work View
Increments the view count for a specific work post.

- **URL:** `/v1/interactions/work/:slug/view`
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <access_token>` (Required)

### User Scenarios

#### Case 1: Successfully Record View
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "View recorded successfully",
  "data": {
    "work_id": "uuid-1"
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

#### Case 3: Work Slug Not Found
- **Status:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Work not found"
}
```

#### Case 4: Internal Server Error
- **Status:** `500 Internal Server Error`
- **Response Body:**
```json
{
  "status": false,
  "message": "Failed to record view: database error"
}
```

---

## 3. Toggle Work Like
Increments or decrements the like count for a specific work post.

- **URL:** `/v1/interactions/work/:slug/like`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "is_like": "boolean (required) - true to like, false to unlike"
}
```

### User Scenarios

#### Case 1: Successfully Toggle Like
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Like toggled successfully",
  "data": {
    "work_id": "uuid-1"
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

#### Case 3: Work Slug Not Found
- **Status:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Work not found"
}
```

#### Case 4: Validation Failed (Missing Field)
- **Status:** `422 Unprocessable Entity`
- **Response Body:**
```json
{
  "status": false,
  "message": "Validation failed",
  "details": [
    {
      "field": "is_like",
      "message": "is_like field is required"
    }
  ]
}
```

#### Case 5: Bad Request (Malformed Body)
- **Status:** `400 Bad Request`
- **Response Body:**
```json
{
  "status": false,
  "message": "Invalid request body"
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

## 4. Update Work Metadata (Admin Only)
Manually updates the view or like counts.

- **URL:** `/v1/interactions/work/:id`
- **Method:** `PATCH`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "views_count": "integer (optional) - minimum: 0",
  "likes_count": "integer (optional) - minimum: 0"
}
```

### User Scenarios

#### Case 1: Successfully Update Metadata
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Work metadata updated successfully",
  "data": {
    "work_id": "uuid-1"
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

#### Case 3: Forbidden (Not an Admin)
- **Status:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": false,
  "message": "Forbidden: Admin role required"
}
```

#### Case 4: Metadata Record ID Not Found
- **Status:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Work metadata record not found"
}
```

#### Case 5: Validation Failed (Semantic Errors)
- **Status:** `422 Unprocessable Entity`
- **Response Body:**
```json
{
  "status": false,
  "message": "Validation failed",
  "details": [
    {
      "field": "views_count",
      "message": "Views count cannot be negative"
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

## 5. Delete Work Metadata (Admin Only)
Permanently removes metadata.

- **URL:** `/v1/interactions/work/:id`
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
  "message": "Work metadata deleted successfully"
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

#### Case 3: Forbidden
- **Status:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": false,
  "message": "Forbidden: Admin role required"
}
```

#### Case 4: Record ID Not Found
- **Status:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Record not found"
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
