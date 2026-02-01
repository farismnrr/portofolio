# API Contract: Fetch OG Metadata

Extract Open Graph metadata from a URL.

- **URL**: `/v1/og/fetch`
- **Method**: `GET`
- **Auth Required**: No

## Query Parameters
- `url` (string, required): Target URL.

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": true,
  "message": "Metadata fetched successfully",
  "data": {
    "url": "string",
    "title": "string",
    "description": "string",
    "image": "string"
  }
}
```

### 2. Error: Bad Request
- **Status**: `400 Bad Request`
- **Description**: URL parameter is missing.
- **Response**: See [common/errors.md#400-bad-request](../common/errors.md#400-bad-request)
