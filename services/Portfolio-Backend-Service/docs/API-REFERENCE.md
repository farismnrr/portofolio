# API Reference

Complete API endpoint documentation for Portfolio Backend Service.

---

## Base URL

```
http://localhost:8080  # Development
https://api.example.com # Production
```

All API responses follow the standard response format defined in [common/errors.md](../api/docs/contracts/common/errors.md).

---

## Endpoints by Domain

### Health & Status

- **Health Check** - `GET /health` - Server health status
- **API Status** - `GET /v1/status` - API v1 availability

---

### Authentication (SSO Proxy)

All endpoints proxy requests to the SSO service. See [auth contracts](../api/docs/contracts/auth/).

- `POST /v1/auth/login` - Login via SSO (requires Bearer token from SSO)
- `POST /v1/auth/refresh` - Refresh access token using refresh token cookie
- `GET /v1/auth/user` - Get current user information
- `POST /v1/auth/logout` - Logout and clear refresh token

**Reference**: [auth contracts](../api/docs/contracts/auth/)

---

### Page Authentication (Password-based)

Guest access to protected pages using simple password authentication.

- `POST /v1/page-auth/authenticate` - Authenticate with page password
- `GET /v1/page-auth/check` - Check current authentication status

**Reference**: [site contracts](../api/docs/contracts/site/)

---

### Content (Open Graph)

Fetch and proxy Open Graph metadata from URLs.

- `GET /v1/og/fetch` - Fetch OG metadata from URL
- `GET /v1/og/proxy` - Proxy image from URL

**Reference**: [content contracts](../api/docs/contracts/content/)

---

### About Section

Public and admin endpoints for profile information.

#### Profile (Public)

- `GET /v1/about` - Get about information
- `PATCH /v1/about/avatar` - Update avatar (admin only)
- `PATCH /v1/about` - Update profile (admin only)

**Reference**: [about/profile contracts](../api/docs/contracts/about/profile/)

#### Social Links

- `GET /v1/about/social-links` - List social links
- `POST /v1/about/social-links` - Create social link (admin only)
- `PATCH /v1/about/social-links/:id` - Update social link (admin only)
- `DELETE /v1/about/social-links/:id` - Delete social link (admin only)

**Reference**: [about/social_links contracts](../api/docs/contracts/about/social_links/)

#### Work Experience

- `GET /v1/about/work-experiences` - List work experiences
- `POST /v1/about/work-experiences` - Create work experience (admin only)
- `PATCH /v1/about/work-experiences/:id` - Update work experience (admin only)
- `DELETE /v1/about/work-experiences/:id` - Delete work experience (admin only)

**Reference**: [about/work_experience contracts](../api/docs/contracts/about/work_experience/)

#### Education

- `GET /v1/about/education` - List education
- `POST /v1/about/education` - Create education (admin only)
- `PATCH /v1/about/education/:id` - Update education (admin only)
- `DELETE /v1/about/education/:id` - Delete education (admin only)

**Reference**: [about/education contracts](../api/docs/contracts/about/education/)

#### Skills

- `GET /v1/about/skills` - List skill categories
- `POST /v1/about/skills` - Create skill category (admin only)
- `PATCH /v1/about/skills/:id` - Update skill category (admin only)
- `DELETE /v1/about/skills/:id` - Delete skill category (admin only)
- `POST /v1/about/skills/:id/tags` - Add skill tag (admin only)
- `DELETE /v1/about/skills/tags/:tag_id` - Delete skill tag (admin only)

**Reference**: [about/skills contracts](../api/docs/contracts/about/skills/)

---

### Interactions (Works & Blogs)

Public and admin endpoints for portfolio works and blog posts.

#### Works

- `GET /v1/interactions/works` - List all works
- `GET /v1/interactions/works/:slug` - Get work by slug
- `POST /v1/interactions/works` - Create work (admin only)
- `PUT /v1/interactions/works/:id` - Update work (admin only)
- `DELETE /v1/interactions/works/:id` - Delete work (admin only)
- `PATCH /v1/interactions/works/:slug/view` - Record work view
- `PATCH /v1/interactions/works/:slug/like` - Like work
- `PATCH /v1/interactions/works/:slug` - Update work metadata (admin only)

**Reference**: [interaction/works contracts](../api/docs/contracts/interaction/works/)

#### Blogs

- `GET /v1/interactions/blogs` - List all blogs
- `GET /v1/interactions/blogs/:slug` - Get blog by slug
- `POST /v1/interactions/blogs` - Create blog (admin only)
- `PUT /v1/interactions/blogs/:id` - Update blog (admin only)
- `DELETE /v1/interactions/blogs/:id` - Delete blog (admin only)
- `PATCH /v1/interactions/blogs/:slug/view` - Record blog view
- `PATCH /v1/interactions/blogs/:slug/like` - Like blog
- `PATCH /v1/interactions/blogs/:slug` - Update blog metadata (admin only)

**Reference**: [interaction/blogs contracts](../api/docs/contracts/interaction/blogs/)

#### Comments

- `POST /v1/interactions/comments` - Create comment
- `GET /v1/interactions/:post_type/:post_slug/comments` - Get comments for post
- `DELETE /v1/interactions/comments/:id` - Delete comment (admin only)
- `PUT /v1/interactions/comments/:id` - Update comment (admin only)

**Reference**: [interaction/comments contracts](../api/docs/contracts/interaction/comments/)

---

### Dashboard (Protected - Requires Admin)

- `GET /v1/dashboard` - Get dashboard overview data

**Reference**: [dashboard contracts](../api/docs/contracts/dashboard/)

---

### API Documentation

- `GET /swagger` - Swagger UI documentation
- `GET /swagger/config.js` - Swagger configuration

---

## Authentication & Authorization

### Protected Endpoints

Endpoints marked as "admin only" require:

1. Valid JWT token in `Authorization` header: `Bearer {access_token}`
2. User must have `admin` role in tenant context

### Response Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (duplicate entry) |
| `422` | Validation Error |
| `429` | Rate Limited |
| `500` | Internal Server Error |

---

## Contract-Driven Development

All endpoints are contract-driven. For detailed specifications, request/response examples, and test scenarios, see:

📁 [Contracts Directory](../api/docs/contracts/)

Each endpoint has a corresponding contract file defining:
- Request format and validation
- Response structure and examples
- Error scenarios and handling
- Test cases and validation rules

