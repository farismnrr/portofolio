# API Contract: Check Page Auth

Check if public page authentication is valid.

- **URL**: `/v1/page-auth/check`
- **Method**: `GET`
- **Auth Required**: No (Uses cookie)

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Authenticated",
  "data": {
    "authenticated": true
  }
}
```

### 2. Error: Unauthorized
- **Status**: `401 Unauthorized`
- **Response**: See [common/errors.md#401-unauthorized](../common/errors.md#401-unauthorized)
