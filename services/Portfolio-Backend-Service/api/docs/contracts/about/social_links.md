# API Contract: Social Links (About Domain)

This document defines the API contract for managing social media links (stored in the `social_links` table).

## Authentication: SSO Integration
This API integrates with the SSO Service for authentication. Most operations require a valid JWT Access Token.

- **Header:** `Authorization: Bearer <access_token>`
- **Validation:** The backend verifies the token and retrieves user metadata (ID, Role, Tenant) via the SSO `VerifyUser` endpoint.

---

## 1. Get Social Links
Retrieves a list of social links associated with the current user's profile.

- **URL:** `/v1/about/social-links`
- **Method:** `GET`
- **Headers:**
  - `Accept: application/json`

### User Scenarios

#### Case 1: Successfully Retrieve Links
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Social links retrieved successfully",
  "data": {
    "social_links": [
      {
        "id": "uuid-v4-string",
        "name": "GitHub",
        "link": "https://github.com/username",
        "icon": "github",
        "order_by": 1
      },
      {
        "id": "uuid-v4-string",
        "name": "LinkedIn",
        "link": "https://linkedin.com/in/username",
        "icon": "linkedin",
        "order_by": 2
      }
    ]
  }
}
```

#### Case 2: Unauthorized
- **Status:** `401 Unauthorized`
- **Response Body:**
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

---

## 2. Create Social Link
Adds a new social link to the profile.

- **URL:** `/v1/about/social-links`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "name": "string (required, max 100 chars)",
  "link": "string (required, valid URL)",
  "icon": "string (optional)",
  "order_by": "integer (optional, default 0)"
}
```

### User Scenarios

#### Case 1: Successfully Created
- **Status:** `201 Created`
- **Response Body:**
```json
{
  "status": true,
  "message": "Social link created successfully",
  "data": {
    "social_link": {
      "id": "new-uuid-v4",
      "name": "Twitter",
      "link": "https://twitter.com/username",
      "icon": "twitter",
      "order_by": 3
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
      "field": "link",
      "message": "Invalid URL format"
    }
  ]
}
```

---

## 3. Update Social Link
Updates an existing social link.

- **URL:** `/v1/about/social-links/:id`
- **Method:** `PATCH`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
Fields are optional; only provided fields will be updated.
```json
{
  "name": "string",
  "link": "string (valid URL)",
  "icon": "string",
  "order_by": "integer"
}
```

### User Scenarios

#### Case 1: Successfully Updated
- **Status:** `200 OK`
- **Response Body:**
```json
{
  "status": true,
  "message": "Social link updated successfully"
}
```

#### Case 2: Not Found
- **Status:** `404 Not Found`
- **Response Body:**
```json
{
  "status": false,
  "message": "Social link not found"
}
```

---

## 4. Delete Social Link
Removes a social link.

- **URL:** `/v1/about/social-links/:id`
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
  "message": "Social link deleted successfully"
}
```

#### Case 2: Not Found
- **Status:** `404 Not Found`
