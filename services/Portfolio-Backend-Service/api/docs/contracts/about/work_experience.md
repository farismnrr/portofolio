# API Contract: Work Experience (About Domain)

This document defines the API contract for managing work history and achievements (stored in `work_experiences` and `work_achievements`).

## Authentication
Every endpoint in this domain requires a valid JWT Access Token.
- **Header:** `Authorization: Bearer <access_token>`

---

## 1. Get Work Experiences
Retrieves user's work history including achievements.

- **URL:** `/v1/about/work-experiences`
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

## 2. Create Work Experience
Adds a new job entry. Optionally includes initial achievements.

- **URL:** `/v1/about/work-experiences`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "company": "string (required) - Company name",
  "role": "string (required) - Job title",
  "timeframe": "string (required) - e.g., '2020 - Present'",
  "order_by": "integer (optional)",
  "achievements": [
    {
      "content": "string (required) - Achievement description",
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
    "experience_id": "new-uuid"
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
  "message": "Validation failed"
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

## 3. Update Work Experience
Updates company, role, timeframe, or replaces achievements.

- **URL:** `/v1/about/work-experiences/:id`
- **Method:** `PATCH`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "company": "string (optional)",
  "role": "string (optional)",
  "timeframe": "string (optional)"
}
```

### User Scenarios

#### Case 1: Successfully Updated
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Work experience updated successfully",
  "data": {
    "experience_id": "uuid"
  }
}
```

#### Case 2: ID Not Found
- **Status Code:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Work experience not found"
}
```

---

## 4. Delete Work Experience
Deletes a job entry and its achievements.

- **URL:** `/v1/about/work-experiences/:id`
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
  "message": "Work experience deleted successfully"
}
```

#### Case 2: ID Not Found
- **Status Code:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Work experience not found"
}
```

---

## 5. Add Achievement
Adds a single achievement to a work experience.

- **URL:** `/v1/about/work-experiences/:id/achievements`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "content": "string (required) - Achievement description",
  "order_by": "integer (optional)"
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
    "achievement_id": "new-uuid"
  }
}
```

#### Case 2: Experience Not Found
- **Status Code:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Work experience not found"
}
```

---

## 6. Delete Achievement
Removes a specific achievement.

- **URL:** `/v1/about/work-experiences/achievements/:achievement_id`
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
  "message": "Achievement deleted successfully"
}
```

#### Case 2: ID Not Found
- **Status Code:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Achievement not found"
}
```
