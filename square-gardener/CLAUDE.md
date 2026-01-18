# Claude.md - Square Gardener Project Guidelines

## Project Overview

Square Gardener is a React-based web application for managing square foot gardens. It helps users track plants, watering schedules, and harvest times.

## Tech Stack

- **Framework**: React 19 + Vite 7
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Deployment**: GitHub Pages via GitHub Actions

## Code Coverage Policy

**CRITICAL: This project enforces 100% code coverage.**

### Coverage Requirements

All code changes must maintain 100% coverage across all metrics:

| Metric | Required |
|--------|----------|
| Lines | 100% |
| Branches | 100% |
| Functions | 100% |
| Statements | 100% |

### Running Tests

```bash
# Run tests in watch mode during development
npm run test

# Run tests with coverage report (used in CI)
npm run test:ci

# Run tests with UI
npm run test:ui
```

### Writing Tests

When adding new features or modifying existing code:

1. **Write tests first** (or alongside) for any new functionality
2. **Cover all branches** - test both true and false paths of conditionals
3. **Test error handling** - ensure error paths are covered
4. **Test edge cases** - null values, empty arrays, invalid inputs

### Test File Organization

Tests should be co-located with their source files:
- `src/components/MyComponent.jsx` -> `src/components/MyComponent.test.jsx`
- `src/utils/storage.js` -> `src/utils/storage.test.js`
- `src/pages/Home.jsx` -> `src/pages/Home.test.jsx`

### CI/CD Integration

The project has two GitHub Actions workflows:

**PR Quality Checks** (`.github/workflows/pr-checks.yml`):
- Runs on all pull requests to main
- Executes linting (`npm run lint`)
- Runs tests with coverage (`npm run test:ci`)
- **Blocks PR merging if tests fail or coverage drops below 100%**
- Uploads coverage reports as artifacts

**Deployment** (`.github/workflows/deploy.yml`):
- Runs on pushes to main branch
- Executes the same quality checks
- Builds and deploys to GitHub Pages
- Only deploys if all checks pass

### Branch Protection Rules

To enforce test coverage on PRs, configure the following branch protection rules in GitHub:

1. Go to **Settings** → **Branches** → **Branch protection rules**
2. Add rule for `main` branch:
   - ✅ **Require a pull request before merging**
     - Require approvals: 1 (optional)
   - ✅ **Require status checks to pass before merging**
     - Add required check: `test-and-coverage`
   - ✅ **Require branches to be up to date before merging**
   - ✅ **Do not allow bypassing the above settings**

With these rules:
- All changes must go through a pull request
- The `test-and-coverage` job must pass (including 100% coverage)
- PRs cannot be merged if tests fail or coverage drops
- Direct pushes to main are blocked

### Coverage Configuration

Coverage thresholds are configured in `vitest.config.js`:

```javascript
coverage: {
  thresholds: {
    lines: 100,
    branches: 100,
    functions: 100,
    statements: 100
  }
}
```

### Excluded Files

The following files are excluded from coverage calculations:
- `node_modules/`
- `src/test/` (test setup files)
- Configuration files (`vite.config.js`, `vitest.config.js`, etc.)
- `src/main.jsx` (application entry point)

## Development Guidelines

### Before Committing

1. Run `npm run lint` to check for linting errors
2. Run `npm run test:ci` to verify 100% coverage
3. Fix any failing tests or coverage gaps before pushing

### Adding New Components

When adding a new component:

1. Create the component file
2. Create a corresponding test file
3. Write tests covering:
   - Basic rendering
   - User interactions
   - Props variations
   - Edge cases
4. Verify coverage with `npm run test:ci`

### Modifying Existing Code

When modifying existing code:

1. Run existing tests to ensure they pass
2. Update tests if behavior changes
3. Add new tests for new functionality
4. Verify coverage is maintained at 100%

## Project Structure

```
square-gardener/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── data/           # Static data and utilities
│   ├── utils/          # Utility functions
│   ├── test/           # Test setup
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── .github/
│   └── workflows/      # CI/CD configuration
└── package.json
```
