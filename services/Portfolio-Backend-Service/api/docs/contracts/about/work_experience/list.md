# API Contract: Get Work Experiences

Retrieve the list of work experience records.

- **URL**: `/v1/about/work-experiences`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Work experiences retrieved successfully",
  "data": {
    "work_experiences": [
      {
        "id": "uuid",
        "company": "...",
        "role": "...",
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
