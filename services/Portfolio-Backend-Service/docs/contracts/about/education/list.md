# API Contract: Get Educations

Retrieve the list of education records.

- **URL**: `/v1/about/education`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Education history retrieved successfully",
  "data": {
    "educations": [
      {
        "id": "uuid",
        "institution": "...",
        "degree": "...",
        "period": "...",
        "description": "...",
        "order_by": 1
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
