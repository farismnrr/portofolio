# API Contract: Social Links (About Domain)

This document defines the API contract for managing social media links (stored in the `social_links` table).

## Authentication
Every endpoint in this domain requires a valid JWT Access Token.
- **Header:** `Authorization: Bearer <access_token>`

---

## 1. Get Social Links
Retrieves a list of social links associated with the current user's profile.

- **URL:** `/v1/about/social-links`
- **Method:** `GET`
- **Headers:**
  - `Authorization: Bearer <access_token>` (Required)
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
  "name": "string (required) - Service name (e.g. GitHub)",
  "link": "string (required) - Full profile URL",
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
  "message": "Social link created successfully",
  "data": {
    "social_link_id": "new-uuid"
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
      "field": "link",
      "message": "Invalid URL format"
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

## 3. Update Social Link
Updates an existing social link.

- **URL:** `/v1/about/social-links/:id`
- **Method:** `PATCH`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (Required)

### Request Body
```json
{
  "name": "string (optional)",
  "link": "string (optional) - valid URL",
  "icon": "string (optional)",
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
  "message": "Social link updated successfully",
  "data": {
    "social_link_id": "uuid"
  }
}
```

#### Case 2: ID Not Found
- **Status Code:** `404 NOT FOUND`
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

#### Case 2: ID Not Found
- **Status Code:** `404 NOT FOUND`
- // Response Body:
```json
{
  "status": false,
  "message": "Social link not found"
}
```
