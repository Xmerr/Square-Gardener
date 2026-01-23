# Claude.md - Square Gardener Project Guidelines

## Project Overview

Square Gardener is a React-based web application for planning square foot gardens. It helps users visualize garden layouts, plan planting schedules, and track harvests.

## Tech Stack

- **Framework**: React 19 + Vite 7
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Deployment**: GitHub Pages via GitHub Actions

## Code Coverage Policy

**CRITICAL: This project enforces high code coverage thresholds.**

### Coverage Requirements

All code changes must maintain coverage above these thresholds:

| Metric | Required |
|--------|----------|
| Lines | 99% |
| Branches | 97% |
| Functions | 99% |
| Statements | 99% |

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
- **Blocks PR merging if tests fail or coverage drops below thresholds**
- Uploads coverage reports as artifacts

**Deployment** (`.github/workflows/deploy.yml`):
- Runs on pushes to main branch
- Executes the same quality checks
- Builds and deploys to GitHub Pages
- Only deploys if all checks pass

Branch protection is enabled on the main branch, requiring the `test-and-coverage` check to pass before PRs can be merged.

### Coverage Configuration

Coverage thresholds and exclusions are configured in `vitest.config.js`. Excluded from coverage: `node_modules/`, `src/test/`, config files, and `src/main.jsx`.

## Development Guidelines

### Before Committing

1. Run `npm run lint` to check for linting errors
2. Run `npm run test:ci` to verify coverage thresholds
3. Fix any failing tests or coverage gaps before pushing

### Adding/Modifying Code

1. Create test file alongside source file (co-located)
2. Write tests covering: basic rendering, interactions, props variations, edge cases
3. Run `npm run test:ci` to verify coverage thresholds
4. Update existing tests if behavior changes

## Project Structure

```
./
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Bed*           # BedCard, BedForm, BedSelector, BedManager, BedGridPreview, BedDeleteDialog
│   │   ├── Plant*         # PlantCard, PlantForm, PlantSelector
│   │   ├── Planning*      # PlanningGrid, PlantingTimeline, PrintablePlan, PlanSummary
│   │   ├── FrostDateForm  # Frost date input
│   │   ├── SquareDetails  # Grid square popup
│   │   ├── MonthDayPicker # Date picker
│   │   ├── OverrideIndicator
│   │   └── Navigation
│   ├── pages/
│   │   ├── Home.jsx       # Landing page
│   │   ├── MyGarden.jsx   # Garden management (beds, plants)
│   │   ├── Calendar.jsx   # Planting calendar
│   │   ├── Planner.jsx    # Planning mode
│   │   └── NotFound.jsx   # 404 page
│   ├── data/
│   │   └── plantLibrary.js  # Plant database
│   ├── utils/
│   │   ├── storage.js       # localStorage CRUD (beds, plants, settings)
│   │   ├── harvestDate.js   # Harvest date calculations
│   │   ├── plantingSchedule.js
│   │   ├── planningAlgorithm.js
│   │   ├── companionStatus.js
│   │   ├── frostDateLookup.js
│   │   ├── frostDateStorage.js
│   │   └── dateFormatting.js
│   ├── test/              # Test setup
│   ├── App.jsx            # Main app + routing
│   └── main.jsx           # Entry point
├── docs/specs/            # Feature specifications
├── .github/workflows/     # CI/CD
└── package.json
```

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Landing page |
| `/my-garden` | MyGarden | Manage beds and plants |
| `/calendar` | Calendar | Planting calendar |
| `/planner` | Planner | Planning mode |

## State Management

Data is persisted to `localStorage` via `src/utils/storage.js`:
- **Garden beds**: `addGardenBed()`, `getBedById()`, `updateGardenBed()`, `removeGardenBed()`
- **Plants**: `addPlantToGarden()`, `removePlantFromGarden()`, `getPlantsByBed()`
- **Frost dates**: `saveFrostDates()`, `getFrostDates()` (via `frostDateStorage.js`)

## Feature Specifications

Feature specifications are located in `docs/specs/`. Each spec documents requirements, design, and implementation details for a planned feature.
