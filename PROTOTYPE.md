# Prototype: Hello World React App

## Objective

Create a minimal "Hello World" React application with automated deployment to GitHub Pages using GitHub Actions.

## Architecture

### Frontend
- **Framework**: React (Create React App or Vite)
- **Styling**: CSS (minimal, to be expanded later)
- **Build Tool**: Vite (recommended for faster builds) or Create React App

### Deployment Pipeline
- **Hosting**: GitHub Pages (free static hosting)
- **CI/CD**: GitHub Actions
- **Trigger**: Automatic deployment on push to `main` branch
- **Build Process**:
  1. Install dependencies
  2. Run build command
  3. Deploy build artifacts to `gh-pages` branch

## Initial Features

The prototype will display:
- A "Hello World" message
- Basic styling to confirm CSS is working
- Responsive layout (mobile-friendly)

## Setup Instructions

### 1. Initialize React App

```bash
# Using Vite (recommended)
npm create vite@latest square-gardener -- --template react
cd square-gardener
npm install

# OR using Create React App
npx create-react-app square-gardener
cd square-gardener
```

### 2. Configure GitHub Pages

Add to `package.json`:
```json
{
  "homepage": "https://<username>.github.io/<repository-name>"
}
```

### 3. GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'  # Use './build' for CRA

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 4. Repository Settings

Enable GitHub Pages:
1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. Save

## Current Status

The prototype has been implemented and is available on the `claude/init-plant-tracker-app-xJHAd` branch:

- ✅ React app created with Vite
- ✅ Hello World Square Gardener page implemented
- ✅ Responsive styling with gardening theme
- ✅ GitHub Actions workflow configured
- ✅ Build tested successfully

### Manual Steps Required to Deploy

To complete the deployment to GitHub Pages, you need to:

1. **Merge to main branch** (via GitHub UI):
   - Go to your repository on GitHub
   - Create a Pull Request from `claude/init-plant-tracker-app-xJHAd` to `main`
   - Merge the PR

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Select "GitHub Actions"
   - Save

3. **Trigger Deployment**:
   - Once merged to main, the GitHub Actions workflow will automatically run
   - Monitor progress in the Actions tab
   - App will be live at `https://<username>.github.io/Square-Gardener/`

4. **Set main as default branch** (optional):
   - Go to repository Settings → Branches
   - Change default branch to `main`

## Success Criteria

- [x] React app runs locally (`npm run dev` or `npm start`)
- [x] Displays "Hello World" message
- [ ] GitHub Actions workflow runs successfully on push to main
- [ ] App is accessible at GitHub Pages URL
- [x] Page is responsive on mobile devices

## Testing the Prototype

1. Make a change to the app
2. Commit and push to `main` branch
3. Watch GitHub Actions run (Actions tab)
4. Verify deployment at GitHub Pages URL
5. Test on mobile device or browser DevTools

## Next Steps

Once the prototype is validated:
- Move to MVP implementation (see [MVP.md](./MVP.md))
- Add routing
- Implement component structure
- Add state management
