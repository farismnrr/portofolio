# API Contract: Logout

Invalidate session and clear cookies.

- **URL**: `/v1/auth/logout`
- **Method**: `POST`
- **Auth Required**: Yes (Optional)

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Description**: Clears the `refresh_token` cookie.
- **Response**:
```json
{
  "status": true,
  "message": "Logout successful"
}
```
