# API Contract: Technical Skills (About Domain)

This document defines the API contract for managing technical skills, organized by categories and tags (stored in `skill_categories` and `skill_tags`).

## Authentication: SSO Integration
- **Header:** `Authorization: Bearer <access_token>`

---

## 1. Get Skills
Retrieves all skill categories and their associated tags.

- **URL:** `/v1/about/skills`
- **Method:** `GET`
- **Headers:** `Accept: application/json`

### User Scenarios

#### Case 1: Successfully Retrieve
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Skills retrieved successfully",
  "data": {
    "skill_categories": [
      {
        "id": "uuid",
        "title": "Languages",
        "description": "Programming languages I use daily",
        "order_by": 1,
        "tags": [
          {
            "id": "uuid",
            "name": "Go",
            "icon": "golang",
            "order_by": 1
          },
          {
            "id": "uuid",
            "name": "TypeScript",
            "icon": "typescript",
            "order_by": 2
          }
        ]
      }
    ]
  }
}
```

#### Case 2: Internal Server Error
- **Status:** `500 Internal Server Error`
- **Response Body:**
```json
{
  "status": false,
  "message": "Internal server error"
}
```

---

## 2. Create Skill Category
Adds a new category of skills.

- **URL:** `/v1/about/skills`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <access_token>`

### Request Body
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "order_by": "integer",
  "tags": [
    {
      "name": "string (tag name)",
      "icon": "string (icon identifier)",
      "order_by": "integer"
    }
  ]
}
```

### User Scenarios

#### Case 1: Created
- **Status:** `201 Created`
- **Response Body:**
```json
{
  "status": true,
  "message": "Skill category created successfully",
  "data": {
    "skill_category": {
      "id": "new-uuid",
      "title": "Backend",
      "order_by": 3,
      "tags": [...]
    }
  }
}
```

#### Case 2: Validation Failed
- **Status:** `422 Unprocessable Entity`
- **Response Body:**
```json
{
  "status": false,
  "message": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

#### Case 3: Unauthorized (Missing or Invalid Token)
- **Status:** `401 Unauthorized`
- **Response Body:**
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

#### Case 4: Forbidden (Insufficient Permissions)
- **Status:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": false,
  "message": "Forbidden: Insufficient permissions"
}
```

---

## 3. Update Skill Category
Updates category details.

- **URL:** `/v1/about/skills/:id`
- **Method:** `PATCH`
- **Headers:** `Authorization: Bearer <access_token>`

### Request Body
```json
{
  "title": "string",
  "description": "string"
}
```

### User Scenarios
- **Status:** `200 OK`

---

## 4. Delete Skill Category
Deletes a category and all its tags.

- **URL:** `/v1/about/skills/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <access_token>`

### User Scenarios
- **Status:** `200 OK`

---

## 5. Add Skill Tag
Adds a specific skill tag to a category.

- **URL:** `/v1/about/skills/:id/tags`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <access_token>`

### Request Body
```json
{
  "name": "string (required)",
  "icon": "string (optional)",
  "order_by": "integer"
}
```

### User Scenarios

#### Case 1: Successfully Created
- **Status:** `201 Created`
- **Response Body:**
```json
{
  "status": true,
  "message": "Skill tag added successfully",
  "data": {
    "skill_tag": {
      "id": "new-uuid",
      "name": "Docker",
      "icon": "docker",
      "order_by": 1
    }
  }
}
```

#### Case 2: Skill Category Not Found
- **Status:** `404 Not Found`
- **Response Body:**
```json
{
  "status": false,
  "message": "Skill category not found"
}
```

#### Case 3: Unauthorized (Missing or Invalid Token)
- **Status:** `401 Unauthorized`
- **Response Body:**
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

#### Case 4: Forbidden (Insufficient Permissions)
- **Status:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": false,
  "message": "Forbidden: Insufficient permissions"
}
```

---

## 6. Delete Skill Tag
Removes a specific tag.

- **URL:** `/v1/about/skills/tags/:tag_id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <access_token>`

### User Scenarios

#### Case 1: Successfully Deleted (Soft Delete)
- **Status:** `200 OK`
- **Description:** The tag is marked as deleted via `deleted_at`.
- **Response Body:**
```json
{
  "status": true,
  "message": "Skill tag deleted successfully"
}
```

#### Case 2: Not Found
- **Status:** `404 Not Found`
- **Response Body:**
```json
{
  "status": false,
  "message": "Skill tag not found"
}
```

#### Case 3: Unauthorized (Missing or Invalid Token)
- **Status:** `401 Unauthorized`
- **Response Body:**
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

#### Case 4: Forbidden (Insufficient Permissions)
- **Status:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": false,
  "message": "Forbidden: Insufficient permissions"
}
#### Case 5: Internal Server Error
- **Status:** `500 Internal Server Error`
- **Response Body:**
```json
{
  "status": false,
  "message": "Internal server error"
}
```
