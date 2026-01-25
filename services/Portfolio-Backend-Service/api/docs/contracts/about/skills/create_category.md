# API Contract: Create Skill Category

Add a new skill category.

- **URL**: `/v1/about/skills`
- **Method**: `POST`
- **Auth Required**: Yes (Bearer Token)
- **Required Role**: `admin`

## Request Body
```json
{
  "name": "string (required)",
  "order_by": "integer (optional)"
}
```

## Scenarios

### 1. Created
- **Status**: `201 Created`
- **Response**:
```json
{
  "status": true,
  "message": "Category created successfully",
  "data": {
    "category_id": "uuid"
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

### 5. Error: Unsupported Media Type
- **Status**: `415 Unsupported Media Type`
- **Response**: See [common/errors.md#415-unsupported-media-type](../../common/errors.md#415-unsupported-media-type)

### 6. Error: Validation Failed
- **Status**: `422 Unprocessable Entity`
- **Response**: See [common/errors.md#422-unprocessable-entity](../../common/errors.md#422-unprocessable-entity)

### 7. Error: Internal Server Error
- **Status**: `500 Internal Server Error`
- **Response**: See [common/errors.md#500-internal-server-error](../../common/errors.md#500-internal-server-error)
