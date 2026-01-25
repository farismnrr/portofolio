# API Contract: Proxy Image

Proxy external image requests.

- **URL**: `/v1/og/proxy`
- **Method**: `GET`
- **Auth Required**: No

## Query Parameters
- `url` (string, required): Image URL.

## Scenarios

### 1. Success
- **Status**: `200 OK`
- **Response**: Binary image data.

### 2. Error: Bad Request
- **Status**: `400 Bad Request`
- **Response**: See [common/errors.md#400-bad-request](../common/errors.md#400-bad-request)
