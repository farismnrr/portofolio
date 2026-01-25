# API Contract: Login

Proxy endpoint to handle SSO login and secure refresh token storage.

- **URL**: `/v1/auth/login`
- **Method**: `POST`
- **Auth Required**: No

## Request Body
```json
{
  "refresh_token": "string (required)"
}
```

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Description**: Sets the `refresh_token` as an HttpOnly, Secure cookie.
- **Response**:
```json
{
  "status": true,
  "message": "Login successful"
}
```

### 2. Error: Bad Request
- **Status**: `400 Bad Request`
- **Description**: Missing or invalid refresh token.
- **Response**: See [common/errors.md#400-bad-request](../common/errors.md#400-bad-request)
