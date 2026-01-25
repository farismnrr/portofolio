# API Contract: Get User Info

Retrieve authenticated user details and verify RBAC.

- **URL**: `/v1/auth/user`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "role": "admin",
      "tenant_id": "uuid"
    }
  }
}
```

### 2. Error: Unauthorized (RBAC Required)
- **Status**: `401 Unauthorized`
- **Description**: User exists but role is not `admin`. Triggers forced logout.
- **Response**: See [common/errors.md#401-unauthorized](../common/errors.md#401-unauthorized)

### 3. Error: Unauthorized (Missing/Invalid Token)
- **Status**: `401 Unauthorized`
- **Response**: See [common/errors.md#401-unauthorized](../common/errors.md#401-unauthorized)
