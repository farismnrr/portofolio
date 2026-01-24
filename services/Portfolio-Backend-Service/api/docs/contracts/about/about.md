# API Contract: About (Basic Profile)

This document defines the API contract for managing basic profile data (stored in the `abouts` table).

## Authentication: SSO Integration
This API integrates with the SSO Service for authentication. Most operations require a valid JWT Access Token.

- **Header:** `Authorization: Bearer <access_token>`
- **Validation:** The backend verifies the token and retrieves user metadata (ID, Role, Tenant) via the SSO `VerifyUser` endpoint.

---

## 1. Get About Information
Retrieves basic profile information such as name, role, description, and avatar URL.

- **URL:** `/v1/about`
- **Method:** `GET`
- **Headers:**
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
  "name": "string (required)",
  "role": "string (required)",
  "description": "string (required)"
}
```

### User Scenarios

#### Case 1: Successfully Update Profile
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "About profile updated successfully"
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
      "field": "name",
      "message": "Name cannot be empty"
    }
  ]
}
```

#### Case 3: Forbidden (Insufficient Permissions)
- **Status:** `403 Forbidden`
- **Response Body:**
```json
{
  "status": false,
  "message": "Forbidden: Insufficient permissions"
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
- `avatar`: File (Required, Image only)

### User Scenarios

#### Case 1: Successfully Upload Avatar
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Avatar updated successfully",
  "data": {
    "about": {
      "avatar_url": "https://storage.googleapis.com/farismnrr-storage/avatars/new-avatar.jpg"
    }
  }
}
```

#### Case 2: Invalid File Type
- **Status:** `400 Bad Request`
- **Response Body:**
```json
{
  "status": false,
  "message": "Invalid file type: Only images are allowed"
}
```

#### Case 3: File Too Large
- **Status:** `413 Payload Too Large`
- **Response Body:**
```json
{
  "status": false,
  "message": "File size exceeds the 2MB limit"
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
