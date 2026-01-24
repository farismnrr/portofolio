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

#### Case 1: Created
- **Status:** `201 Created`
- **Response Body:**
```json
{
  "status": true,
  "message": "Education entry created successfully",
  "data": {
    "education": {
      "id": "new-uuid",
      "institution": "Institute of Tech",
      "degree": "M.Sc. Data Science",
      "order_by": 2
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
      "field": "institution",
      "message": "Institution name is required"
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

#### Case 1: Successfully Updated
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Education entry updated successfully"
}
```

#### Case 2: Not Found
- **Status:** `404 Not Found`
- **Response Body:**
```json
{
  "status": false,
  "message": "Education entry not found"
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

## 4. Delete Education
Removes an education record.

- **URL:** `/v1/about/education/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <access_token>`

### User Scenarios

#### Case 1: Successfully Deleted (Soft Delete)
- **Status:** `200 OK`
- **Description:** The record is marked as deleted via `deleted_at`.
- **Response Body:**
```json
{
  "status": true,
  "message": "Education entry deleted successfully"
}
```

#### Case 2: Not Found
- **Status:** `404 Not Found`
- **Response Body:**
```json
{
  "status": false,
  "message": "Education entry not found"
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
