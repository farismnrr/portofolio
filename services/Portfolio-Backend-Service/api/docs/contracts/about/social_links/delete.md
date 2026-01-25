# API Contract: Delete Social Link

Permanently remove a social link.

- **URL**: `/v1/about/social-links/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Bearer Token)
- **Required Role**: `admin`

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Social link deleted successfully"
}
```

### 2. Error: Unauthorized
- **Status**: `401 Unauthorized`
- **Response**: See [common/errors.md#401-unauthorized](../../common/errors.md#401-unauthorized)

### 3. Error: Forbidden
- **Status**: `403 Forbidden`
- **Response**: See [common/errors.md#403-forbidden](../../common/errors.md#403-forbidden)

### 4. Error: Not Found
- **Status**: `404 Not Found`
- **Response**: See [common/errors.md#404-not-found](../../common/errors.md#404-not-found)

### 5. Error: Internal Server Error
- **Status**: `500 Internal Server Error`
- **Response**: See [common/errors.md#500-internal-server-error](../../common/errors.md#500-internal-server-error)
