# API Contract: Get Social Links

Retrieve all active social links.

- **URL**: `/v1/about/social-links`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Social links retrieved successfully",
  "data": {
    "social_links": [
      {
        "id": "uuid",
        "platform_name": "GitHub",
        "url": "https://github.com/...",
        "icon_key": "github",
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
