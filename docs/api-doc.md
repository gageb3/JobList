## 🧾 API Documentation (Swagger / OpenAPI)

Our REST API is documented using **Swagger UI** and **OpenAPI** standards.  
This allows developers and collaborators to understand, test, and extend our API easily.

### Overview
- All API routes are documented in `/api/openapi.yaml`.
- Swagger UI is hosted at `/api/docs`.
- The documentation updates automatically as new routes are added.

### Purpose
- Makes it easy for new developers to understand endpoints.
- Provides live testing tools.
- Ensures consistency between backend and frontend teams.

### Example Endpoints (for reference)
| Verb | Path | Purpose |
|------|------|----------|
| GET | /api/users | Fetch all users |
| POST | /api/jobs | Create new job entry |
| PUT | /api/jobs/:id | Update job info |
| DELETE | /api/jobs/:id | Delete a job |

### Resources
- [Swagger Documentation](https://swagger.io/docs/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)

---
