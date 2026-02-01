# API Contract: Update Avatar

Upload a new profile picture to cloud storage.

- **URL**: `/v1/about/avatar`
- **Method**: `PATCH`
- **Auth Required**: Yes (Bearer Token)
- **Required Role**: `admin`

## Request Body (Multipart/Form-Data)
- `avatar`: File (Required, Image, Max 2MB)

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Avatar updated successfully"
}
```

### 2. Error: Bad Request
- **Status**: `400 Bad Request`
- **Response**: See [common/errors.md#400-bad-request](../../common/errors.md#400-bad-request)

### 3. Error: Unauthorized
- **Status**: `401 Unauthorized`
- **Response**: See [common/errors.md#401-unauthorized](../../common/errors.md#401-unauthorized)

### 4. Error: Forbidden
- **Status**: `403 Forbidden`
- **Response**: See [common/errors.md#403-forbidden](../../common/errors.md#403-forbidden)

### 5. Error: Payload Too Large
- **Status**: `413 Payload Too Large`
- **Response**: See [common/errors.md#413-payload-too-large](../../common/errors.md#413-payload-too-large)

### 6. Error: Unsupported Media Type
- **Status**: `415 Unsupported Media Type`
- **Response**: See [common/errors.md#415-unsupported-media-type](../../common/errors.md#415-unsupported-media-type)

### 7. Error: Internal Server Error
- **Status**: `500 Internal Server Error`
- **Response**: See [common/errors.md#500-internal-server-error](../../common/errors.md#500-internal-server-error)
