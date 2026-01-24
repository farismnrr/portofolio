# API Contract: Work Experience (About Domain)

This document defines the API contract for managing work history and achievements (stored in `work_experiences` and `work_achievements`).

## Authentication: SSO Integration
- **Header:** `Authorization: Bearer <access_token>`

---

## 1. Get Work Experiences
Retrieves user's work history including achievements.

- **URL:** `/v1/about/work-experiences`
- **Method:** `GET`
- **Headers:** `Accept: application/json`

### User Scenarios

#### Case 1: Successfully Retrieve
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Work experiences retrieved successfully",
  "data": {
    "work_experiences": [
      {
        "id": "uuid",
        "company": "Tech Corp",
        "role": "Senior Engineer",
        "timeframe": "2020 - Present",
        "order_by": 1,
        "achievements": [
          {
            "id": "uuid",
            "content": "Led backend migration",
            "order_by": 1
          }
        ]
      }
    ]
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

---

## 2. Create Work Experience
Adds a new job entry. Optionally includes initial achievements.

- **URL:** `/v1/about/work-experiences`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>`

### Request Body
```json
{
  "company": "string (required)",
  "role": "string (required)",
  "timeframe": "string (required, e.g., '2020-2023')",
  "order_by": "integer",
  "achievements": [
    {
      "content": "string (achievement description)",
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
  "message": "Work experience created successfully",
  "data": {
    "work_experience": {
      "id": "new-uuid",
      "company": "StartUp Inc",
      "role": "CTO",
      "achievements": [...]
    }
  }
}
```

---

## 3. Update Work Experience
Updates company, role, timeframe, or replaces achievements.

- **URL:** `/v1/about/work-experiences/:id`
- **Method:** `PATCH`
- **Headers:** `Authorization: Bearer <access_token>`

### Request Body
```json
{
  "company": "string",
  "role": "string",
  "timeframe": "string"
}
```
*Note: To update achievements, use specific achievement endpoints or sending a full list strategy (TBD based on implementation).*

### User Scenarios
- **Status:** `200 OK`

---

## 4. Delete Work Experience
Deletes a job entry and its achievements.

- **URL:** `/v1/about/work-experiences/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <access_token>`

### User Scenarios
- **Status:** `200 OK`

---

## 5. Add Achievement
Adds a single achievement to a work experience.

- **URL:** `/v1/about/work-experiences/:id/achievements`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <access_token>`

### Request Body
```json
{
  "content": "string (required)",
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
  "message": "Achievement added successfully",
  "data": {
    "achievement": {
      "id": "new-uuid",
      "content": "Delivered project X",
      "order_by": 1
    }
  }
}
```

#### Case 2: Work Experience Not Found
- **Status:** `404 Not Found`
- **Response Body:**
```json
{
  "status": false,
  "message": "Work experience not found"
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

## 6. Delete Achievement
Removes a specific achievement.

- **URL:** `/v1/about/work-experiences/achievements/:achievement_id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <access_token>`

### User Scenarios

#### Case 1: Successfully Deleted (Soft Delete)
- **Status:** `200 OK`
- **Description:** The achievement is marked as deleted via `deleted_at`.
- **Response Body:**
```json
{
  "status": true,
  "message": "Achievement deleted successfully"
}
```

#### Case 2: Not Found
- **Status:** `404 Not Found`
- **Response Body:**
```json
{
  "status": false,
  "message": "Achievement not found"
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
