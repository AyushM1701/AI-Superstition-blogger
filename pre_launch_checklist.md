# Pre-Launch Checklist

Before promoting the AI Blogger application to a production environment, complete all items in this checklist.

## 1. Vercel Environment Variables
Ensure the following variables are set securely in your Vercel Project Settings (Production Environment):
- [ ] `GEMINI_API_KEY`: A valid Google AI Studio key.
- [ ] `NEXT_PUBLIC_SITE_URL`: Your actual production domain URL (e.g. `https://tona-totka.com`).

## 2. GitHub Actions Setup
- [ ] **Repository Secrets**: Ensure `GEMINI_API_KEY` is added to your GitHub repository secrets so the Action can run.
- [ ] **Action Permissions**: Under Settings > Actions > General, ensure "Workflow permissions" is set to "Read and write permissions" so the Action can push new posts back to the repo.

## 3. Dry Run
- [ ] Manually trigger the `.github/workflows/daily-totka.yml` action from the GitHub Actions tab.
- [ ] Verify the action completes successfully, pushes the new post to the `data/posts/` folder.
- [ ] Verify Vercel detects the new commit and automatically builds and deploys the new static site.
