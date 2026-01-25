# API Contract: Education (About Domain)

This document defines the API contract for managing educational records (stored in the `educations` table).

## Authentication
Every endpoint in this domain requires a valid JWT Access Token.
- **Header:** `Authorization: Bearer <access_token>`

---

## 1. Get Educations
Retrieves list of degrees and institutions.

- **URL:** `/v1/about/education`
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

## 2. Create Education
Adds a new education entry.

- **URL:** `/v1/about/education`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "institution": "string (required) - Name of university/school",
  "degree": "string (required) - Earned degree or certification",
  "period": "string (required) - Timeframe (e.g., '2016-2020')",
  "description": "string (optional) - Additional details",
  "order_by": "integer (optional) - Display order"
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
    "education_id": "new-uuid"
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

#### Case 3: Forbidden
- **Status Code:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": false,
  "message": "Forbidden: Insufficient permissions"
}
```

#### Case 4: Validation Failed
- **Status Code:** `422 Unprocessable Entity`
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

#### Case 5: Internal Server Error
- **Status Code:** `500 Internal Server Error`
- **Response Body:**
```json
{
  "status": false,
  "message": "Internal server error"
}
```

---

## 3. Update Education
Updates an education record.

- **URL:** `/v1/about/education/:id`
- **Method:** `PATCH`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "institution": "string (optional)",
  "degree": "string (optional)",
  "period": "string (optional)",
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
  "message": "Education entry updated successfully",
  "data": {
    "education_id": "uuid"
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

#### Case 3: Forbidden
- **Status Code:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": false,
  "message": "Forbidden"
}
```

#### Case 4: Not Found
- **Status Code:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Education entry not found"
}
```

#### Case 5: Validation Failed
- **Status Code:** `422 Unprocessable Entity`
- **Response Body:**
```json
{
  "status": false,
  "message": "Validation failed"
}
```

#### Case 6: Internal Server Error
- **Status Code:** `500 Internal Server Error`
- **Response Body:**
```json
{
  "status": false,
  "message": "Internal server error"
}
```

---

## 4. Delete Education
Removes an education record.

- **URL:** `/v1/about/education/:id`
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
  "message": "Education entry deleted successfully"
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

#### Case 3: Forbidden
- **Status Code:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": false,
  "message": "Forbidden"
}
```

#### Case 4: Not Found
- **Status Code:** `404 NOT FOUND`
- **Response Body:**
```json
{
  "status": false,
  "message": "Education entry not found"
}
```

#### Case 5: Internal Server Error
- **Status Code:** `500 Internal Server Error`
- **Response Body:**
```json
{
  "status": false,
  "message": "Internal server error"
}
```
