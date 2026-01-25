# API Contract: Technical Skills (About Domain)

This document defines the API contract for managing technical skills, organized by categories and tags (stored in `skill_categories` and `skill_tags`).

## Authentication
Every endpoint in this domain requires a valid JWT Access Token.
- **Header:** `Authorization: Bearer <access_token>`

---

## 1. Get Skills
Retrieves all skill categories and their associated tags.

- **URL:** `/v1/about/skills`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <access_token>` (Required)
  - `Accept: application/json`

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
          }
        ]
      }
    ]
  }
}
```

#### Case 2: Unauthorized
- **Status Code:** `401 Unauthorized`
- **Response Body:**
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

#### Case 3: Internal Server Error
- **Status Code:** `500 Internal Server Error`
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
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "title": "string (required) - Category name",
  "description": "string (optional) - Short description",
  "order_by": "integer (optional) - Display order",
  "tags": [
    {
      "name": "string (required) - Tag name",
      "icon": "string (optional) - Icon identifier",
      "order_by": "integer (optional)"
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
    "category_id": "new-uuid"
  }
}
```

#### Case 2: Unauthorized
- **Status Code:** `401 Unauthorized`
- **Response Body:**
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

#### Case 3: Validation Failed
- **Status Code:** `422 Unprocessable Entity`
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

#### Case 4: Internal Server Error
- **Status Code:** `500 Internal Server Error`
- **Response Body:**
```json
{
  "status": false,
  "message": "Internal server error"
}
```

---

## 3. Update Skill Category
Updates category details.

- **URL:** `/v1/about/skills/:id`
- **Method:** `PATCH`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "order_by": "integer (optional)"
}
```

### User Scenarios

#### Case 1: Successfully Updated
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Skill category updated successfully",
  "data": {
    "category_id": "uuid"
  }
}
```

#### Case 2: ID Not Found
- **Status Code:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Skill category not found"
}
```

---

## 4. Delete Skill Category
Deletes a category and all its tags.

- **URL:** `/v1/about/skills/:id`
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
  "message": "Skill category deleted successfully"
}
```

#### Case 2: ID Not Found
- **Status Code:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Skill category not found"
}
```

---

## 5. Add Skill Tag
Adds a specific skill tag to a category.

- **URL:** `/v1/about/skills/:id/tags`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "name": "string (required) - Tag name",
  "icon": "string (optional) - Icon identifier",
  "order_by": "integer (optional) - Display order"
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
    "tag_id": "new-uuid"
  }
}
```

#### Case 2: Category Not Found
- **Status Code:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Skill category not found"
}
```

#### Case 3: Validation Failed
- **Status Code:** `422 Unprocessable Entity`
- **Response Body:**
```json
{
  "status": false,
  "message": "Validation failed"
}
```

---

## 6. Delete Skill Tag
Removes a specific tag.

- **URL:** `/v1/about/skills/tags/:tag_id`
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
  "message": "Skill tag deleted successfully"
}
```

#### Case 2: ID Not Found
- **Status Code:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Skill tag not found"
}
```
