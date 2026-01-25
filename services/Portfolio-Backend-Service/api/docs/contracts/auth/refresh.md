# API Contract: Refresh Token

Exchange the stored refresh token cookie for a new access token.

- **URL**: `/v1/auth/refresh`
- **Method**: `POST`
- **Auth Required**: No (Uses cookie)

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "string"
  }
}
```

### 2. Error: Unauthorized
- **Status**: `401 Unauthorized`
- **Description**: Refresh token is missing, invalid, or expired.
- **Response**: See [common/errors.md#401-unauthorized](../common/errors.md#401-unauthorized)
