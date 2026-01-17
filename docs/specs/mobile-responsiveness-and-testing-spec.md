# Mobile Responsiveness & Automated Testing Specification

## Status: Draft
## Version: 1.0
## Last Updated: 2026-01-17
## Author: Claude Code

---

## 1. Overview

### 1.1 Problem Statement

The Square Gardener application currently has minimal responsive design (single 768px breakpoint) and no automated testing infrastructure. As the app grows beyond the prototype phase into MVP features (Plant Library, Garden Planner, Watering Schedule), it needs:

1. **Comprehensive mobile support** across all device sizes to serve gardeners checking their plants on-the-go
2. **Robust test coverage** to maintain code quality and prevent regressions as features are added

**Impact**: Without proper responsiveness, mobile users (estimated 60%+ of gardening app users) will have a degraded experience. Without tests, bugs will reach production, and developers will lack confidence when making changes.

### 1.2 Goals

1. **Full mobile responsiveness** across all breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
2. **100% code coverage** on lines, branches, and functions
3. **Automated enforcement** via CI/CD pipeline that blocks deployments when coverage drops
4. **Developer experience** that makes writing tests and responsive code intuitive
5. **Consistent design system** with Tailwind CSS utility classes

### 1.3 Non-Goals

1. Native mobile app development (PWA may be considered later)
2. E2E/Playwright testing (future enhancement)
3. Visual regression testing (future enhancement)
4. Server-side rendering or SSR responsiveness
5. Print stylesheet support

---

## 2. Background

### 2.1 Context

Square Gardener is a React 19 + Vite application for gardeners to manage plants using square foot gardening principles. The app is deployed to GitHub Pages via GitHub Actions.

### 2.2 Current State

| Aspect | Current State |
|--------|---------------|
| **Responsive Design** | Single breakpoint at 768px in App.css |
| **CSS Framework** | Plain CSS with flexbox |
| **Testing** | None - no test framework installed |
| **Coverage** | 0% - no tests exist |
| **CI/CD** | GitHub Actions for build/deploy only |

### 2.3 Related Work / Prior Art

- **Tailwind CSS**: Industry-standard utility-first CSS framework with responsive prefixes
- **Vitest**: Modern testing framework designed for Vite projects
- **React Testing Library**: Standard for testing React components
- **c8/Istanbul**: Coverage tools compatible with Vitest

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-1 | All UI components must render correctly on mobile (< 640px) | Must | Touch-friendly tap targets |
| FR-2 | All UI components must render correctly on tablet (640-1024px) | Must | Optimal layout for medium screens |
| FR-3 | All UI components must render correctly on desktop (> 1024px) | Must | Full-featured desktop experience |
| FR-4 | Navigation must adapt between mobile hamburger menu and desktop nav | Must | Standard responsive pattern |
| FR-5 | Grid layouts (Garden Planner) must scale appropriately per breakpoint | Must | 4x4 grid visible on all devices |
| FR-6 | Unit tests must exist for all utility functions and hooks | Must | Pure function testing |
| FR-7 | Integration tests must exist for all React components | Must | Using React Testing Library |
| FR-8 | Tests must validate responsive behavior at each breakpoint | Should | Test viewport-dependent rendering |
| FR-9 | Coverage reports must be generated on each test run | Must | HTML and LCOV formats |
| FR-10 | CI pipeline must fail if coverage drops below threshold | Must | Blocking deployment gate |

### 3.2 Non-Functional Requirements

| ID | Category | Requirement | Target |
|----|----------|-------------|--------|
| NFR-1 | Coverage | Line coverage | 100% |
| NFR-2 | Coverage | Branch coverage | 100% |
| NFR-3 | Coverage | Function coverage | 100% |
| NFR-4 | Performance | Test suite execution time | < 30 seconds |
| NFR-5 | Performance | Page load on mobile (3G) | < 3 seconds |
| NFR-6 | Accessibility | Touch targets minimum size | 44x44px |
| NFR-7 | Accessibility | Font size minimum on mobile | 16px base |

### 3.3 Constraints

1. **Must use Vitest** - Native Vite integration, Jest-compatible API
2. **Must use Tailwind CSS** - For consistent responsive utilities
3. **Must integrate with existing GitHub Actions** - Extend current deploy.yml
4. **Coverage exceptions allowed**: `vite.config.js`, `eslint.config.js`, `main.jsx`
5. **No new backend dependencies** - Testing is frontend-only

### 3.4 Assumptions

1. Developers have Node.js 20+ installed locally
2. All new code will be written with tests from the start
3. Existing prototype code (App.jsx) will be refactored to be testable
4. Tailwind CSS is acceptable as a project dependency

---

## 4. Design

### 4.1 Proposed Solution

#### 4.1.1 Mobile Responsiveness

Install and configure Tailwind CSS with the following breakpoint strategy:

```
sm:  640px  - Small tablets, large phones (landscape)
md:  768px  - Tablets
lg:  1024px - Small laptops, tablets (landscape)
xl:  1280px - Desktops
2xl: 1536px - Large desktops (optional)
```

**Mobile-First Approach**: Base styles target mobile, then add responsive prefixes for larger screens.

```jsx
// Example component
<div className="p-4 sm:p-6 md:p-8 lg:p-10">
  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
    Square Gardener
  </h1>
</div>
```

#### 4.1.2 Automated Testing

Install and configure Vitest with React Testing Library:

```
vitest           - Test runner
@testing-library/react  - React component testing
@testing-library/jest-dom - DOM matchers
@vitest/coverage-c8     - Coverage reporting
jsdom            - Browser environment simulation
```

**Test Structure**:
```
src/
├── components/
│   ├── Button.jsx
│   └── Button.test.jsx    # Co-located tests
├── hooks/
│   ├── useGarden.js
│   └── useGarden.test.js
├── utils/
│   ├── plantHelpers.js
│   └── plantHelpers.test.js
└── __tests__/            # Integration tests
    └── App.integration.test.jsx
```

### 4.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions CI/CD                      │
├─────────────────────────────────────────────────────────────┤
│  1. Install Dependencies                                      │
│  2. Run Linting (ESLint)                                     │
│  3. Run Tests (Vitest) ──► Coverage Check ──► FAIL if < 100% │
│  4. Build (Vite)                                             │
│  5. Deploy (GitHub Pages)                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Local Development                          │
├─────────────────────────────────────────────────────────────┤
│  npm run test        - Run tests in watch mode                │
│  npm run test:ci     - Run tests once with coverage           │
│  npm run test:ui     - Open Vitest UI                        │
│  npm run coverage    - Generate coverage report              │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Key Components

| Component | Responsibility | Notes |
|-----------|---------------|-------|
| `tailwind.config.js` | Tailwind CSS configuration | Breakpoints, theme customization |
| `vitest.config.js` | Test runner configuration | Coverage thresholds, test environment |
| `.github/workflows/deploy.yml` | CI/CD pipeline | Add test step before build |
| `src/test/setup.js` | Test setup file | Jest-DOM matchers, global mocks |

### 4.4 Alternatives Considered

| Alternative | Pros | Cons | Why Not Chosen |
|-------------|------|------|----------------|
| Jest instead of Vitest | Larger ecosystem, more docs | Slower, requires extra Vite config | Vitest is purpose-built for Vite |
| Plain CSS with more media queries | No new dependencies | Verbose, harder to maintain | Tailwind provides consistency |
| 80% coverage threshold | Easier to achieve | Allows untested code paths | 100% enforces discipline |
| Pre-commit hooks for coverage | Faster feedback | Slows down commits, can be bypassed | CI gate is authoritative |

### 4.5 Open Questions

- [ ] Should we add Husky for pre-commit linting (not coverage)?
- [ ] Should responsive tests use actual viewport resizing or mock matchMedia?
- [ ] Should we integrate Codecov or Coveralls for coverage badges?

---

## 5. Implementation

### 5.1 Phases / Milestones

| Phase | Description | Deliverables |
|-------|-------------|--------------|
| 1 | **Testing Infrastructure** | Vitest installed, configured, first test passing |
| 2 | **Tailwind CSS Setup** | Tailwind installed, existing styles migrated |
| 3 | **CI/CD Integration** | GitHub Actions runs tests, coverage gate active |
| 4 | **Component Tests** | All existing components have tests at 100% coverage |
| 5 | **Responsive Refactor** | All components use Tailwind responsive classes |

### 5.2 Dependencies

| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| `vitest` | npm package | To install | Test runner |
| `@testing-library/react` | npm package | To install | Component testing |
| `@testing-library/jest-dom` | npm package | To install | DOM matchers |
| `@vitest/coverage-v8` | npm package | To install | Coverage (v8 engine) |
| `jsdom` | npm package | To install | Browser environment |
| `tailwindcss` | npm package | To install | CSS framework |
| `postcss` | npm package | To install | Tailwind dependency |
| `autoprefixer` | npm package | To install | Tailwind dependency |

### 5.3 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 100% coverage slows development | Medium | Medium | Allow coverage to ramp up, enforce only after baseline established |
| Tailwind increases bundle size | Low | Low | Enable purging in production build (default in Tailwind 3+) |
| Flaky viewport tests | Medium | Medium | Use matchMedia mocks instead of actual resizing |
| Existing code hard to test | Medium | High | Refactor to improve testability, extract pure functions |

---

## 6. Success Criteria

### 6.1 Acceptance Criteria

- [ ] Vitest runs successfully with `npm run test`
- [ ] Coverage report shows 100% lines, branches, and functions
- [ ] GitHub Actions workflow includes test step
- [ ] Deployment fails if coverage drops below 100%
- [ ] Tailwind CSS is installed and configured
- [ ] All components use responsive Tailwind classes
- [ ] App renders correctly at all breakpoints (sm, md, lg, xl)
- [ ] No horizontal scrolling on mobile devices
- [ ] Touch targets meet 44x44px minimum
- [ ] All tests pass in CI environment

### 6.2 Metrics

| Metric | Current | Target | How Measured |
|--------|---------|--------|--------------|
| Line Coverage | 0% | 100% | Vitest coverage report |
| Branch Coverage | 0% | 100% | Vitest coverage report |
| Function Coverage | 0% | 100% | Vitest coverage report |
| Responsive Breakpoints | 1 | 4 | Tailwind config |
| Test Execution Time | N/A | < 30s | CI logs |
| Mobile Lighthouse Score | Unknown | > 90 | Lighthouse audit |

---

## 7. Test Plan & Coverage Policy

### 7.1 Test Categories

#### Unit Tests
- **Target**: Pure functions, utility helpers, custom hooks
- **Location**: Co-located with source files (`*.test.js`)
- **Coverage requirement**: 100% of lines, branches, functions

```javascript
// Example: src/utils/plantHelpers.test.js
import { describe, it, expect } from 'vitest';
import { getDaysUntilWatering, getPlantsByCategory } from './plantHelpers';

describe('getDaysUntilWatering', () => {
  it('returns 0 when plant needs water today', () => {
    const plant = { lastWatered: new Date(), wateringInterval: 0 };
    expect(getDaysUntilWatering(plant)).toBe(0);
  });

  it('returns negative when overdue', () => {
    const plant = {
      lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      wateringInterval: 2
    };
    expect(getDaysUntilWatering(plant)).toBe(-1);
  });
});
```

#### Integration Tests
- **Target**: React components, component interactions
- **Location**: Co-located or `src/__tests__/`
- **Coverage requirement**: 100% of component code

```javascript
// Example: src/components/PlantCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PlantCard from './PlantCard';

describe('PlantCard', () => {
  it('renders plant name and watering status', () => {
    render(<PlantCard name="Tomato" daysUntilWater={2} />);

    expect(screen.getByText('Tomato')).toBeInTheDocument();
    expect(screen.getByText(/2 days/i)).toBeInTheDocument();
  });

  it('calls onWater when water button clicked', () => {
    const onWater = vi.fn();
    render(<PlantCard name="Tomato" onWater={onWater} />);

    fireEvent.click(screen.getByRole('button', { name: /water/i }));

    expect(onWater).toHaveBeenCalledTimes(1);
  });
});
```

#### Responsive Tests
- **Target**: Components with responsive behavior
- **Method**: Mock `matchMedia` for different breakpoints

```javascript
// Example: src/components/Navigation.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Navigation from './Navigation';

const mockMatchMedia = (matches) => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

describe('Navigation', () => {
  describe('on mobile (< 640px)', () => {
    beforeEach(() => mockMatchMedia(true));

    it('renders hamburger menu', () => {
      render(<Navigation />);
      expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
    });
  });

  describe('on desktop (>= 1024px)', () => {
    beforeEach(() => mockMatchMedia(false));

    it('renders full navigation links', () => {
      render(<Navigation />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /menu/i })).not.toBeInTheDocument();
    });
  });
});
```

### 7.2 Coverage Configuration

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        'vite.config.js',
        'eslint.config.js',
        'tailwind.config.js',
        'postcss.config.js',
        'src/main.jsx',
      ],
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
    },
  },
});
```

### 7.3 Coverage Enforcement Policy

#### CI/CD Gate Rules

1. **All PRs must pass coverage thresholds** before merge
2. **Deployment is blocked** if coverage falls below 100%
3. **No bypass mechanism** for coverage failures (no `--force` or skip options)

#### GitHub Actions Integration

```yaml
# .github/workflows/deploy.yml (modified)
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: square-gardener/package-lock.json

      - name: Install dependencies
        working-directory: ./square-gardener
        run: npm ci

      - name: Run linting
        working-directory: ./square-gardener
        run: npm run lint

      - name: Run tests with coverage
        working-directory: ./square-gardener
        run: npm run test:ci

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: square-gardener/coverage/

  build-and-deploy:
    needs: test  # Only runs if test job passes
    runs-on: ubuntu-latest
    # ... existing deploy steps
```

#### Local Development Scripts

```json
// package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage && open coverage/index.html"
  }
}
```

### 7.4 Coverage Exceptions

The following files are excluded from coverage requirements:

| File | Reason |
|------|--------|
| `vite.config.js` | Build configuration, not runtime code |
| `eslint.config.js` | Linting configuration |
| `tailwind.config.js` | CSS configuration |
| `postcss.config.js` | PostCSS configuration |
| `src/main.jsx` | React bootstrap entry point (StrictMode wrapper only) |
| `src/test/setup.js` | Test setup utilities |

### 7.5 Test Writing Guidelines

1. **Test behavior, not implementation** - Test what the component does, not how
2. **One assertion focus per test** - Each test should verify one specific behavior
3. **Arrange-Act-Assert pattern** - Clear test structure
4. **Descriptive test names** - `it('shows error message when form validation fails')`
5. **No test pollution** - Each test must be independent
6. **Mock external dependencies** - API calls, timers, browser APIs
7. **Test edge cases** - Empty states, error states, boundary conditions

### 7.6 Coverage Ramp-Up Strategy

Since the project currently has 0% coverage, implement a ramp-up period:

| Week | Coverage Target | Notes |
|------|-----------------|-------|
| Week 1 | 50% | Set up infrastructure, test existing App.jsx |
| Week 2 | 75% | Add tests as new components are built |
| Week 3 | 90% | Cover edge cases and error paths |
| Week 4+ | 100% | Enforce 100% threshold in CI |

**Important**: The 100% threshold should only be enforced in CI after the baseline is established. During ramp-up, coverage is reported but not gated.

---

## 8. Appendix

### 8.1 Glossary

| Term | Definition |
|------|------------|
| **Breakpoint** | A screen width at which the layout changes (e.g., 768px) |
| **Coverage** | Percentage of code executed during test runs |
| **E2E Testing** | End-to-end testing that simulates real user interactions |
| **Integration Test** | Test that verifies multiple units work together |
| **Mobile-First** | Design approach starting with mobile, enhancing for larger screens |
| **Unit Test** | Test for a single function or component in isolation |
| **Vitest** | A Vite-native test runner with Jest-compatible API |

### 8.2 References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### 8.3 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-17 | Claude Code | Initial draft |
