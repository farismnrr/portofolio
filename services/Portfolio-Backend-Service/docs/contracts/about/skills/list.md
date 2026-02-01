# API Contract: Get Skills

Retrieve all skill categories and their associated tags.

- **URL**: `/v1/about/skills`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Skills retrieved successfully",
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Frontend",
        "order_by": 1,
        "tags": [
          { "id": "uuid", "name": "React" }
        ]
      }
    ]
  }
}
```

### 2. Error: Unauthorized
- **Status**: `401 Unauthorized`
- **Response**: See [common/errors.md#401-unauthorized](../../common/errors.md#401-unauthorized)

### 3. Error: Internal Server Error
- **Status**: `500 Internal Server Error`
- **Response**: See [common/errors.md#500-internal-server-error](../../common/errors.md#500-internal-server-error)
