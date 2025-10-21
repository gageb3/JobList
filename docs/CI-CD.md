## ⚙️ CI/CD with GitHub Actions

Our team uses **Continuous Integration and Continuous Deployment (CI/CD)** to automate testing and deployment.

### Overview
GitHub Actions runs workflows automatically when changes are pushed or merged into the repository.  
This ensures our app is tested and deployed consistently.

### Workflow Goals
- Run automated checks (build + test) before merging.
- Deploy staging builds from the `dev` branch to Render.
- Deploy production builds from the `main` branch to Google Cloud.

### Team Process
1. Each feature is developed on a separate branch.
2. A pull request (PR) must be created for review before merging.
3. Once merged:
   - `dev` branch → triggers Render deployment (staging).
   - `main` branch → triggers Google Cloud deployment (production).

### Resources
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Deployments](https://render.com/docs/deploy-hooks)
- [Google Cloud Deployment Guides](https://cloud.google.com/run/docs)

---
