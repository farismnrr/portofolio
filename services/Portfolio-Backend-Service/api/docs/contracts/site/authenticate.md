# API Contract: Page Authentication

Verify password for public page access.

- **URL**: `/v1/page-auth/authenticate`
- **Method**: `POST`
- **Auth Required**: No

## Request Body
```json
{
  "password": "string (required)"
}
```

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Description**: Sets the `authToken` cookie.
- **Response**:
```json
{
  "status": true,
  "message": "Authentication successful"
}
```

### 2. Error: Unauthorized
- **Status**: `401 Unauthorized`
- **Description**: Incorrect password.
- **Response**: See [common/errors.md#401-unauthorized](../common/errors.md#401-unauthorized)
