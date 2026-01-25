# API Contract: About (Basic Profile)

This document defines the API contract for managing basic profile data (stored in the `abouts` table).

## Authentication: SSO Integration
Every endpoint in this domain requires a valid JWT Access Token.
- **Header:** `Authorization: Bearer <access_token>`

---

## 1. Get About Information
Retrieves basic profile information such as name, role, description, and avatar URL.

- **URL:** `/v1/about`
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
  "message": "About information retrieved successfully",
  "data": {
    "about": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Faris Munir",
      "role": "Software Engineer",
      "description": "Software Engineer specializing in backend architecture...",
      "avatar_url": "https://storage.googleapis.com/farismnrr-storage/avatars/faris.jpg"
    }
  }
}
```

#### Case 2: Data Has Never Been Set
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "About information is empty",
  "data": {
    "about": null
  }
}
```

#### Case 3: Unauthorized (Missing or Invalid Token)
- **Status Code:** `401 Unauthorized`
- **Response Body:**
```json
{
  "status": false,
  "message": "Unauthorized"
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

## 2. Update About Profile
Updates text-based profile information (excluding avatar).

- **URL:** `/v1/about`
- **Method:** `PATCH`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "name": "string (required) - Full name",
  "role": "string (required) - Professional role",
  "description": "string (required) - Detailed bio"
}
```

### User Scenarios

#### Case 1: Successfully Update Profile
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "About profile updated successfully",
  "data": {
    "about_id": "550e8400-e29b-41d4-a716-446655440000"
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

#### Case 3: Forbidden (Insufficient Permissions)
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
      "field": "name",
      "message": "Name cannot be empty"
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

## 3. Update Avatar
Uploads a new avatar image to cloud storage and updates the profile.

- **URL:** `/v1/about/avatar`
- **Method:** `PATCH`
- **Headers:**
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body (Form Data)
- `avatar`: File (Required, Image only, Max 2MB)

### User Scenarios

#### Case 1: Successfully Upload Avatar
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Avatar updated successfully",
  "data": {
    "about_id": "550e8400-e29b-41d4-a716-446655440000"
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

#### Case 3: Invalid File Type
- **Status Code:** `400 Bad Request`
- **Response Body:**
```json
{
  "status": false,
  "message": "Invalid file type: Only images are allowed"
}
```

#### Case 4: File Too Large
- **Status Code:** `413 Payload Too Large`
- // Response Body:
```json
{
  "status": false,
  "message": "File size exceeds the 2MB limit"
}
```

#### Case 5: Forbidden (Insufficient Permissions)
- **Status Code:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": false,
  "message": "Forbidden: Insufficient permissions"
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
