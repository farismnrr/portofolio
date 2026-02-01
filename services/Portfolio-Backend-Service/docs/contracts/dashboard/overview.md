# API Contract: Dashboard Overview

Retrieve admin metrics.

- **URL**: `/v1/dashboard`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)
- **Required Role**: `admin`

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Dashboard data retrieved",
  "data": {
    "message": "Welcome to admin dashboard",
    "username": "string",
    "role": "admin"
  }
}
```

### 2. Error: Unauthorized
- **Status**: `401 Unauthorized`
- **Description**: Token invalid or non-admin role.
- **Response**: See [common/errors.md#401-unauthorized](../common/errors.md#401-unauthorized)
