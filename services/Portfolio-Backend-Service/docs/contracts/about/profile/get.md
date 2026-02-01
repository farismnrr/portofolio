# API Contract: Get About Information

Retrieve basic profile info (name, role, bio, avatar).

- **URL**: `/v1/about`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "About information retrieved successfully",
  "data": {
    "about": {
      "id": "uuid",
      "name": "Faris Munir",
      "role": "Software Engineer",
      "description": "...",
      "avatar_url": "https://..."
    }
  }
}
```

### 2. Error: Unauthorized
- **Status**: `401 Unauthorized`
- **Response**: See [common/errors.md#401-unauthorized](../../common/errors.md#401-unauthorized)

### 3. Error: Internal Server Error
- **Status**: `500 Internal Server Error`
- **Response**: See [common/errors.md#500-internal-server-error](../../common/errors.md#500-internal-server-error)
