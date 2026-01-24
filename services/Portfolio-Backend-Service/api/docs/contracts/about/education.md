# API Contract: Education (About Domain)

This document defines the API contract for managing educational records (stored in the `educations` table).

## Authentication: SSO Integration
- **Header:** `Authorization: Bearer <access_token>`

---

## 1. Get Educations
Retrieves list of degrees and institutions.

- **URL:** `/v1/about/education`
- **Method:** `GET`
- **Headers:** `Accept: application/json`

### User Scenarios

#### Case 1: Successfully Retrieve
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Education history retrieved successfully",
  "data": {
    "educations": [
      {
        "id": "uuid",
        "institution": "University of Technology",
        "degree": "B.Sc. Computer Science",
        "period": "2016 - 2020",
        "description": "Graduated with honors",
        "order_by": 1
      }
    ]
  }
}
```

---

## 2. Create Education
Adds a new education entry.

- **URL:** `/v1/about/education`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <access_token>`

### Request Body
```json
{
  "institution": "string (required)",
  "degree": "string (required)",
  "period": "string (required)",
  "description": "string (optional)",
  "order_by": "integer"
}
```

### User Scenarios
- **Status:** `201 Created`

---

## 3. Update Education
Updates an education record.

- **URL:** `/v1/about/education/:id`
- **Method:** `PATCH`
- **Headers:** `Authorization: Bearer <access_token>`

### Request Body
```json
{
  "institution": "string",
  "degree": "string",
  "period": "string",
  "description": "string"
}
```

### User Scenarios
- **Status:** `200 OK`

---

## 4. Delete Education
Removes an education record.

- **URL:** `/v1/about/education/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <access_token>`

### User Scenarios
- **Status:** `200 OK`
