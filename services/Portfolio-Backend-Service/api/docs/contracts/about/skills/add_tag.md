# API Contract: Add Skill Tag

Add a new tag to a skill category.

- **URL**: `/v1/about/skills/:id/tags`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Required Role**: `admin`

## Request Body
```json
{
  "name": "string (required)"
}
```

## Scenarios

### 1. Created
- **Status**: `201 Created`
- **Response**:
```json
{
  "status": true,
  "message": "Tag added successfully",
  "data": {
    "tag_id": "uuid"
  }
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

### 5. Error: Not Found
- **Status**: `404 Not Found`
- **Description**: Category ID not found.
- **Response**: See [common/errors.md#404-not-found](../../common/errors.md#404-not-found)

### 6. Error: Unsupported Media Type
- **Status**: `415 Unsupported Media Type`
- **Response**: See [common/errors.md#415-unsupported-media-type](../../common/errors.md#415-unsupported-media-type)

### 7. Error: Validation Failed
- **Status**: `422 Unprocessable Entity`
- **Response**: See [common/errors.md#422-unprocessable-entity](../../common/errors.md#422-unprocessable-entity)

### 8. Error: Internal Server Error
- **Status**: `500 Internal Server Error`
- **Response**: See [common/errors.md#500-internal-server-error](../../common/errors.md#500-internal-server-error)
