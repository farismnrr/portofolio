# API Contract: Record Work View

Increment the view count for a work project.

- **URL**: `/v1/interactions/work/:slug/view`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "View recorded successfully",
  "data": {
    "work_id": "uuid"
  }
}
```

### 2. Error: Unauthorized
- **Status**: `401 Unauthorized`
- **Response**: See [common/errors.md#401-unauthorized](../../common/errors.md#401-unauthorized)

### 3. Error: Not Found
- **Status**: `404 Not Found`
- **Response**: See [common/errors.md#404-not-found](../../common/errors.md#404-not-found)

### 4. Error: Internal Server Error
- **Status**: `500 Internal Server Error`
- **Response**: See [common/errors.md#500-internal-server-error](../../common/errors.md#500-internal-server-error)
