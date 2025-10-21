## 🚀 Deployment Guide

The JobList app is deployed using **Render** for staging and **Google Cloud** for production.

### Overview
Our deployment process ensures that new updates move smoothly from development → staging → production.

### Environments
- **Development:** Local testing on each teammate’s computer.
- **Staging:** Automatically deployed from the `dev` branch (Render).
- **Production:** Automatically deployed from the `main` branch (Google Cloud).

### Steps to Deploy
1. Merge updates into the correct branch (`dev` or `main`).
2. GitHub Actions triggers the appropriate deployment.
3. Confirm deployment success on the Render or Google Cloud dashboard.

### Best Practices
- Only merge reviewed PRs.
- Verify staging before pushing to production.
- Keep environment variables updated on both hosting platforms.

### Resources
- [Render Deployment Guide](https://render.com/docs/deploy-node-express-app)
- [Google Cloud Run Deployment](https://cloud.google.com/run/docs/deploying)
