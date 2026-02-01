# Standard API Error Responses

This document defines standard error Response bodies used across all domains.

## 400 Bad Request
Used for malformed requests or missing required parameters.
```json
{
  "status": false,
  "message": "Malformed request or missing parameter"
}
```

## 401 Unauthorized
Used when authentication is missing, invalid, or when role-based access check fails (forcing a logout).
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

## 403 Forbidden
Used when a user is authenticated but lacks permission (deprecated in favor of 401 for RBAC forced-logout).
```json
{
  "status": false,
  "message": "Forbidden"
}
```

## 404 Not Found
Used when a requested resource does not exist.
```json
{
  "status": false,
  "message": "Resource not found"
}
```

## 409 Conflict
Used when a request conflicts with the current state of the server (e.g., duplicate unique fields).
```json
{
  "status": false,
  "message": "Conflict: Resource already exists"
}
```

## 413 Payload Too Large
Used when the request entity is larger than limits defined by server.
```json
{
  "status": false,
  "message": "Payload too large"
}
```

## 415 Unsupported Media Type
Used when the request entity has a media type which the server or resource does not support.
```json
{
  "status": false,
  "message": "Unsupported media type"
}
```

## 422 Unprocessable Entity
Used for validation errors.
```json
{
  "status": false,
  "message": "Validation failed",
  "details": [
    {
      "field": "field_name",
      "message": "Error description"
    }
  ]
}
```

## 500 Internal Server Error
Used for unexpected server errors.
```json
{
  "status": false,
  "message": "Internal server error"
}
```
