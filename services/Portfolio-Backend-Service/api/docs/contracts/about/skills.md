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
- **Status:** `201 Created`

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
- **Status:** `201 Created`

---

## 6. Delete Skill Tag
Removes a specific tag.

- **URL:** `/v1/about/skills/tags/:tag_id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <access_token>`

### User Scenarios
- **Status:** `200 OK`
