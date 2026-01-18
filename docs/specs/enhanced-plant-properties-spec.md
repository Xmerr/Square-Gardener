# Enhanced Plant Properties Specification

**Status**: Draft
**Version**: 1.0
**Last Updated**: 2026-01-18
**Author**: Claude
**Stakeholders**: Square Gardener Users, Development Team

---

## 1. Overview

### 1.1 Problem Statement

The current Square Gardener plant tracking system captures minimal information about plants in the user's garden. When adding a plant, users can only specify the plant type and planted date. This lacks the detail needed for effective garden planning and tracking:

- **No variety tracking**: Users growing "Cherokee Purple" vs "Early Girl" tomatoes can't distinguish them
- **No harvest date visibility**: Users must manually calculate or remember when plants will be ready
- **No space customization**: Users can't override the library's default plants-per-square-foot values when their actual spacing differs
- **No succession planting support**: Users can't easily track the same plant type planted at different times

**Impact**: Gardeners who want detailed tracking must maintain separate notes, reducing the app's usefulness for planning harvests and managing garden space effectively.

### 1.2 Goals

1. **Enable variety tracking**: Allow users to specify and view the variety/cultivar of each plant
2. **Automate harvest date calculation**: Calculate expected harvest date from plant date + days to maturity, with manual override option
3. **Support space customization**: Allow per-instance and per-plant-type overrides of plants-per-square-foot values
4. **Enable succession planting**: Treat same plant type planted on different dates as separate garden entries
5. **Provide visual clarity**: Show clear indicators when values are calculated vs manually overridden
6. **Integrate with capacity tracking**: Ensure quantity and space overrides properly affect bed capacity calculations

### 1.3 Non-Goals

- **Variety database**: Not building a database of varieties per plant type (users enter free-form text)
- **Growth stage tracking**: Not tracking seedling/vegetative/flowering/fruiting stages (future enhancement)
- **Actual harvest tracking**: Not tracking when plants were actually harvested or yield amounts (future enhancement)
- **Indoor seed starting**: Not tracking plants started indoors before transplant (plant date is transplant date)
- **Weather-based adjustments**: Not adjusting harvest dates based on weather data
- **Photo tracking**: Not adding photo capabilities to plant entries

---

## 2. Background

### 2.1 Context

Square Foot Gardening (SFG) practitioners track detailed information about their plants to optimize harvests and plan successions. Common tracking includes:

- **Variety**: Important for tracking performance, taste preferences, and disease resistance
- **Plant date**: When seeds were sown or transplants were planted
- **Expected harvest**: Calculated from days to maturity, used for harvest planning
- **Spacing**: May differ from guidelines based on experience or variety characteristics

The current system captures `plantId`, `plantedDate`, `lastWatered`, and `notes`. The plant library provides `daysToMaturity` and `squaresPerPlant` but these aren't surfaced to users or used for calculations.

### 2.2 Current State

**Garden Plant Schema (storage.js)**:
```javascript
{
  id: string,              // 'garden-{timestamp}-{random}'
  plantId: string,         // Reference to plant library (e.g., 'tomato')
  plantedDate: string,     // ISO 8601 timestamp
  lastWatered: string,     // ISO 8601 timestamp
  notes: string            // Free-form user notes
}
```

**Plant Library (plantLibrary.js)**:
- 31 plants with `daysToMaturity` values (25-240 days)
- `squaresPerPlant` values (0.0625 to 1.0)
- Companion/avoid plant relationships
- No variety data

**Bed Management Spec (pending)**:
- Adds `bedId` and `quantity` fields to garden plants
- Capacity calculations use `squaresPerPlant` from library

### 2.3 Prior Art

**Bed Management Spec**: Establishes the `quantity` field and capacity calculation pattern this spec builds upon.

**Related Features**:
- Planning Mode (future) will use harvest dates for layout suggestions
- Bed capacity calculations will consume space override values

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR1: Variety Field
- **FR1.1**: Garden plants have an optional `variety` field (string)
- **FR1.2**: Variety is entered as free-form text (no dropdown)
- **FR1.3**: Variety displays on plant card after plant name (e.g., "Tomato - Cherokee Purple")
- **FR1.4**: Variety is searchable/filterable in plant list
- **FR1.5**: Variety field maximum length: 50 characters

#### FR2: Plant Date Enhancement
- **FR2.1**: Plant date field uses date picker (no time component)
- **FR2.2**: Plant date defaults to current date when adding plant
- **FR2.3**: Plant date is editable after plant creation
- **FR2.4**: Editing plant date recalculates harvest date (if not manually overridden)

#### FR3: Harvest Date Calculation
- **FR3.1**: Expected harvest date is calculated: `plantedDate + daysToMaturity`
- **FR3.2**: Users can manually override the calculated harvest date
- **FR3.3**: Override is stored separately from calculated value
- **FR3.4**: If plant date changes and harvest was NOT overridden, recalculate harvest date
- **FR3.5**: If plant date changes and harvest WAS overridden, keep override (don't recalculate)
- **FR3.6**: Display format: "Expected: Mar 15, 2026" or "Harvest: Mar 15, 2026 (set manually)"

#### FR4: Days to Maturity Override
- **FR4.1**: Users can override `daysToMaturity` per plant instance
- **FR4.2**: Override value must be positive integer (1-365)
- **FR4.3**: Override affects harvest date calculation for that instance
- **FR4.4**: Library default is shown as placeholder/hint when editing
- **FR4.5**: Users can also set garden-wide default per plant type (stored separately)

#### FR5: Plants Per Square Foot Override
- **FR5.1**: Users can override `squaresPerPlant` per plant instance
- **FR5.2**: Override value must be positive number (0.01 - 10)
- **FR5.3**: Override affects bed capacity calculations
- **FR5.4**: Users can also set garden-wide default per plant type
- **FR5.5**: Display as "X per square foot" (calculated: 1 / squaresPerPlant)
- **FR5.6**: For large plants (>1 sq ft), display as "Takes X squares"

#### FR6: Garden-Wide Plant Defaults
- **FR6.1**: Users can set custom default `daysToMaturity` per plant type
- **FR6.2**: Users can set custom default `squaresPerPlant` per plant type
- **FR6.3**: Garden defaults override library defaults for new plants
- **FR6.4**: Garden defaults stored in separate storage key
- **FR6.5**: Instance overrides take precedence over garden defaults

#### FR7: Succession Planting
- **FR7.1**: Adding same plant type on different date creates new garden entry
- **FR7.2**: Each entry has its own variety, dates, and overrides
- **FR7.3**: Same plant type + same date + same variety = same entry (quantity increases)
- **FR7.4**: Plant list can be filtered/grouped by plant date
- **FR7.5**: Visual indicator shows succession groups (same plant type, different dates)

#### FR8: Quantity Integration
- **FR8.1**: Capacity formula: `quantity × squaresPerPlant` (using override if set)
- **FR8.2**: Quantity changes update bed capacity in real-time
- **FR8.3**: Space override changes update bed capacity in real-time

#### FR9: Visual Override Indicators
- **FR9.1**: Calculated values show subtle "auto" indicator (e.g., small icon)
- **FR9.2**: Manually overridden values show "manual" indicator (e.g., pencil icon)
- **FR9.3**: Hovering/tapping indicator shows: "Calculated from library" or "Manually set"
- **FR9.4**: Override indicators visible on plant card and detail view

#### FR10: Large Plant Visualization
- **FR10.1**: Plants requiring >1 square foot show visual indicator
- **FR10.2**: In grid preview, show how plant spans multiple squares
- **FR10.3**: Display: "Takes 2 squares" instead of "0.5 per square foot"
- **FR10.4**: Grid preview uses different color/pattern for multi-square plants

#### FR11: Add Plant Form Updates
- **FR11.1**: Form includes: Plant type, Bed, Variety, Plant date, Quantity
- **FR11.2**: "Advanced" expandable section shows: Days to maturity, Space per plant
- **FR11.3**: Advanced fields show library defaults as placeholders
- **FR11.4**: Calculated harvest date shown in real-time as plant date/maturity entered

#### FR12: Edit Plant Capability
- **FR12.1**: All plant properties editable via plant card "Edit" action
- **FR12.2**: Edit form shows current values (including whether overridden)
- **FR12.3**: "Reset to default" option clears overrides back to library/garden defaults

### 3.2 Non-Functional Requirements

#### NFR1: Performance
- **NFR1.1**: Harvest date calculation completes in <10ms
- **NFR1.2**: Capacity recalculation completes in <50ms
- **NFR1.3**: Form field updates feel instantaneous (<100ms perceived)

#### NFR2: Usability
- **NFR2.1**: Override indicators are subtle, don't clutter the UI
- **NFR2.2**: Advanced options hidden by default to keep form simple
- **NFR2.3**: Calculated values update in real-time as inputs change
- **NFR2.4**: Clear labeling distinguishes "expected harvest" from "actual harvest"

#### NFR3: Data Integrity
- **NFR3.1**: Override flags stored separately from values (can distinguish null override from zero)
- **NFR3.2**: Invalid override values rejected with clear error messages
- **NFR3.3**: Data migration preserves existing plant entries without data loss

#### NFR4: Testing
- **NFR4.1**: Maintain 100% test coverage
- **NFR4.2**: All calculation functions have unit tests
- **NFR4.3**: Edge cases: leap years, very long maturity (garlic: 240 days), fraction spacing

### 3.3 Constraints

- **C1**: Must use existing sessionStorage API (no database migration)
- **C2**: Must maintain backward compatibility with existing plant entries
- **C3**: Must integrate with Bed Management feature (bedId, capacity calculations)
- **C4**: Must follow existing Tailwind design system
- **C5**: Must maintain React 19 + Vite 7 architecture

### 3.4 Assumptions

- **A1**: Users understand "days to maturity" concept
- **A2**: Users enter plant date as transplant date (not seed start date)
- **A3**: Harvest date is estimated; actual harvest varies by conditions
- **A4**: Users want simple defaults with option for advanced customization
- **A5**: Variety field is informational only (no validation against variety database)

---

## 4. Design

### 4.1 Data Model

#### Updated Garden Plant Schema
```javascript
{
  id: string,                    // Existing: 'garden-{timestamp}-{random}'
  plantId: string,               // Existing: Reference to Plant Library
  bedId: string,                 // From Bed Mgmt: Reference to Bed
  quantity: number,              // From Bed Mgmt: Number of plants (default: 1)

  // NEW: Core fields
  variety: string | null,        // User-entered variety name (e.g., 'Cherokee Purple')
  plantedDate: string,           // Existing: ISO 8601 date (YYYY-MM-DD)

  // NEW: Harvest date
  harvestDateOverride: string | null,  // User override (ISO 8601 date), null = calculated

  // NEW: Per-instance overrides
  daysToMaturityOverride: number | null,    // Override library value, null = use default
  squaresPerPlantOverride: number | null,   // Override library value, null = use default

  // Existing
  lastWatered: string,           // ISO 8601 timestamp
  notes: string                  // Free-form user notes
}
```

#### Garden Defaults Schema (NEW)
```javascript
// Storage key: 'square-gardener-garden-defaults'
{
  [plantId]: {
    daysToMaturity: number | null,    // Garden-wide default for this plant type
    squaresPerPlant: number | null    // Garden-wide default for this plant type
  }
}
```

#### Value Resolution Order
1. Instance override (if set)
2. Garden default (if set)
3. Plant library default

### 4.2 Calculation Functions

#### Calculate Expected Harvest Date
```javascript
function calculateHarvestDate(plantedDate, plantId, gardenPlant, gardenDefaults) {
  // 1. If harvest date is manually overridden, return override
  if (gardenPlant.harvestDateOverride) {
    return { date: gardenPlant.harvestDateOverride, isOverride: true };
  }

  // 2. Resolve days to maturity (instance > garden > library)
  const daysToMaturity =
    gardenPlant.daysToMaturityOverride ??
    gardenDefaults[plantId]?.daysToMaturity ??
    plantLibrary[plantId].daysToMaturity;

  // 3. Calculate: plantedDate + daysToMaturity
  const harvestDate = addDays(plantedDate, daysToMaturity);

  return { date: harvestDate, isOverride: false };
}
```

#### Calculate Space Used
```javascript
function calculateSpaceUsed(gardenPlant, gardenDefaults) {
  const plantId = gardenPlant.plantId;

  // Resolve squaresPerPlant (instance > garden > library)
  const squaresPerPlant =
    gardenPlant.squaresPerPlantOverride ??
    gardenDefaults[plantId]?.squaresPerPlant ??
    plantLibrary[plantId].squaresPerPlant;

  // Total space = quantity × squaresPerPlant
  return gardenPlant.quantity * squaresPerPlant;
}
```

### 4.3 Component Architecture

#### Modified Components

**PlantCard.jsx**
- Display variety after plant name
- Show harvest date with override indicator
- Show space usage with override indicator
- Add "Edit" button

**MyGarden.jsx**
- Update "Add Plant" form with new fields
- Add "Advanced" expandable section
- Show calculated harvest date in real-time
- Support plant editing

#### New Components

**PlantForm.jsx** (Shared Add/Edit Form)
- Plant type selector (add only)
- Bed selector
- Variety text input
- Plant date picker
- Quantity input
- Expandable "Advanced" section:
  - Days to maturity override
  - Space per plant override
- Real-time harvest date preview
- Location: `src/components/PlantForm.jsx`

**OverrideIndicator.jsx**
- Small icon indicating calculated vs manual value
- Tooltip on hover with explanation
- Props: `isOverride: boolean`, `defaultValue: string`
- Location: `src/components/OverrideIndicator.jsx`

**GardenDefaults.jsx** (Settings Panel)
- List of plant types user has customized
- Edit defaults per plant type
- Reset to library defaults option
- Location: `src/components/GardenDefaults.jsx`

### 4.4 UI Design

#### Plant Card - Enhanced
```
┌─────────────────────────────────────────────────────────────┐
│ 🍅 Tomato - Cherokee Purple                    [Edit] [···] │
│    Main Garden Bed · Qty: 4                                 │
│                                                              │
│    📅 Planted: Jan 15, 2026                                 │
│    🌾 Harvest: Mar 26, 2026  ⚙️                              │
│       ↳ 70 days to maturity                                 │
│                                                              │
│    📐 Space: 4 sq ft (1 per plant)  ✏️                       │
│    💧 Last watered: 2 days ago                              │
└─────────────────────────────────────────────────────────────┘

Legend:
⚙️ = Calculated from library
✏️ = Manually overridden
```

#### Add Plant Form - Enhanced
```
┌───────────────────────────────────────────┐
│ Add Plant to Garden                        │
├───────────────────────────────────────────┤
│ Plant Type: [▼ Tomato                ]     │
│ Bed:        [▼ Main Garden Bed       ]     │
│                                            │
│ Variety:    [Cherokee Purple         ]     │
│             (optional)                     │
│                                            │
│ Plant Date: [📅 Jan 15, 2026         ]     │
│ Quantity:   [4                       ]     │
│                                            │
│ ▶ Advanced Options                         │
│ ┌────────────────────────────────────┐    │
│ │ Days to Maturity: [    ] (70)      │    │
│ │ Space per Plant:  [    ] (1 sq ft) │    │
│ └────────────────────────────────────┘    │
│                                            │
│ Expected Harvest: Mar 26, 2026             │
│                                            │
│                    [Cancel]  [Add Plant]   │
└───────────────────────────────────────────┘
```

#### Large Plant Grid Preview
```
For a plant with squaresPerPlant = 2 (takes 2 squares):

┌─┬─┬─┬─┐
│█████│🥬│🥬│  Legend:
├─┼─┼─┼─┤  █████ = Squash (spans 2 squares)
│🥕│🥕│🥕│🥕│  🥬 = Lettuce
├─┼─┼─┼─┤  🥕 = Carrot
│  │  │  │  │
└─┴─┴─┴─┘
```

### 4.5 Alternatives Considered

**Alternative 1: Variety Dropdown with Database**
- Pre-populate varieties per plant type from external database
- **Rejected**: Adds complexity, maintenance burden, may not match user's actual variety names

**Alternative 2: Separate Succession Planting UI**
- Explicit "Start succession" button that creates linked plant entries
- **Rejected**: Adds complexity; automatic separate entries is simpler

**Alternative 3: Calculated vs Override as Single Field**
- Store calculated value, let user edit directly
- **Rejected**: Can't distinguish "user set to 70" from "calculated as 70"; recalculation destroys intentional overrides

**Alternative 4: No Garden-Wide Defaults**
- Only per-instance overrides
- **Rejected**: Tedious to override every plant if user always uses different spacing

### 4.6 Open Questions

1. **Q**: Should variety field autocomplete from previously entered varieties?
   **A**: Nice-to-have for future; out of scope for MVP

2. **Q**: Should harvest date show countdown (e.g., "15 days until harvest")?
   **A**: Yes, include countdown in display

3. **Q**: What happens to harvest date if plant is "done" (harvested/removed)?
   **A**: Plant removal deletes entry; no "completed harvest" state in this spec

---

## 5. Implementation

### 5.1 Implementation Phases

#### Phase 1: Data Model & Storage
**Tasks**:
1. Update garden plant schema with new fields
2. Create garden defaults storage functions
3. Implement value resolution utilities (instance > garden > library)
4. Create harvest date calculation function
5. Create space calculation function (updated)
6. Write comprehensive unit tests

**Acceptance Criteria**:
- All storage functions handle new fields correctly
- Value resolution follows precedence order
- Backward compatible with existing plant data

#### Phase 2: Add Plant Form Enhancement
**Tasks**:
1. Create PlantForm component (shared add/edit)
2. Add variety field to form
3. Add date picker for plant date
4. Create expandable "Advanced" section
5. Show real-time harvest date preview
6. Write component tests

**Acceptance Criteria**:
- Form creates plants with all new fields
- Advanced section toggles correctly
- Harvest date updates as inputs change

#### Phase 3: Plant Card Enhancement
**Tasks**:
1. Create OverrideIndicator component
2. Update PlantCard to show variety
3. Display harvest date with indicator
4. Display space usage with indicator
5. Add "Edit" action to plant card
6. Write component tests

**Acceptance Criteria**:
- Variety displays correctly
- Override indicators appear/hide appropriately
- Edit action opens edit form

#### Phase 4: Edit Plant Functionality
**Tasks**:
1. Implement edit mode in PlantForm
2. Pre-populate form with existing values
3. Handle plant date change → harvest recalculation
4. Add "Reset to default" for overrides
5. Write integration tests

**Acceptance Criteria**:
- Edit preserves existing data
- Changing plant date recalculates harvest (if not overridden)
- Reset clears overrides correctly

#### Phase 5: Garden Defaults
**Tasks**:
1. Create GardenDefaults settings panel
2. Implement per-plant-type default storage
3. Integrate garden defaults into value resolution
4. Add UI to access garden defaults
5. Write tests for defaults precedence

**Acceptance Criteria**:
- Users can set defaults per plant type
- Defaults apply to new plants
- Instance overrides take precedence

#### Phase 6: Large Plant Visualization
**Tasks**:
1. Update BedGridPreview for multi-square plants
2. Create visual representation of plant spanning squares
3. Update display text ("Takes X squares")
4. Write visual regression tests if applicable

**Acceptance Criteria**:
- Large plants visually span correct squares
- Display text adapts based on plant size

### 5.2 Dependencies

**Internal**:
- Bed Management feature (bedId field, capacity calculations)
- Plant library daysToMaturity values
- Existing storage infrastructure

**External**:
- None

**Blocking**:
- None - can be developed in parallel with Bed Management

### 5.3 Migration Strategy

**Existing Plants**:
- New fields default to `null` (no override)
- Calculated values used when override is null
- No data loss; existing plants work immediately

**Code**:
```javascript
function migrateExistingPlant(plant) {
  return {
    ...plant,
    variety: plant.variety ?? null,
    harvestDateOverride: plant.harvestDateOverride ?? null,
    daysToMaturityOverride: plant.daysToMaturityOverride ?? null,
    squaresPerPlantOverride: plant.squaresPerPlantOverride ?? null
  };
}
```

### 5.4 Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Form complexity overwhelms users | Medium | Medium | Hide advanced options by default; progressive disclosure |
| Override vs calculated confusion | Low | Medium | Clear visual indicators with tooltips |
| Harvest date calculation errors | High | Low | Extensive unit tests, handle edge cases (leap years) |
| Performance with many plants | Low | Low | Memoize calculations, lazy recalculation |
| Backward compatibility issues | High | Low | Null-safe migrations, existing plants unchanged |

---

## 6. Success Criteria

### 6.1 Acceptance Criteria

**Variety Field**:
- [ ] Users can enter variety when adding plant
- [ ] Variety displays on plant card
- [ ] Variety is editable
- [ ] Variety is optional (null allowed)

**Harvest Date**:
- [ ] Harvest date calculated from plant date + days to maturity
- [ ] Users can override calculated harvest date
- [ ] Changing plant date recalculates harvest (if not overridden)
- [ ] Visual indicator shows calculated vs manual

**Override System**:
- [ ] Per-instance override for days to maturity
- [ ] Per-instance override for space per plant
- [ ] Garden-wide defaults per plant type
- [ ] Correct precedence: instance > garden > library
- [ ] "Reset to default" clears overrides

**Capacity Integration**:
- [ ] Quantity × space override = correct bed capacity
- [ ] Capacity updates when override changes
- [ ] Large plants display correctly in grid

**User Experience**:
- [ ] Add form includes all new fields
- [ ] Advanced options are collapsible
- [ ] Real-time harvest date preview
- [ ] All fields are editable after creation

### 6.2 Key Metrics

**Usage Metrics**:
- 50%+ of new plants have variety specified
- 20%+ of users set at least one override
- 10%+ of users set garden-wide defaults

**Quality Metrics**:
- 100% test coverage maintained
- Zero calculation bugs in production
- <5% of users report confusion about overrides

### 6.3 Success Definition

This feature is successful if:
1. **Users track varieties**: Majority of new plants include variety
2. **Harvest planning enabled**: Users can see expected harvest dates
3. **Space customization used**: Users override spacing when needed
4. **No complexity complaints**: Advanced features don't overwhelm casual users
5. **Zero regressions**: Existing plant functionality unchanged

---

## 7. Test Plan

### 7.1 Unit Tests

**Calculation Functions**:
```javascript
describe('calculateHarvestDate', () => {
  test('calculates from library daysToMaturity');
  test('uses instance override when set');
  test('uses garden default when no instance override');
  test('returns override when harvestDateOverride is set');
  test('handles leap year correctly');
  test('handles 240-day maturity (garlic)');
});

describe('calculateSpaceUsed', () => {
  test('calculates from library squaresPerPlant');
  test('uses instance override when set');
  test('uses garden default when no instance override');
  test('multiplies by quantity correctly');
  test('handles fractional squaresPerPlant');
  test('handles squaresPerPlant > 1 (large plants)');
});

describe('resolveValue', () => {
  test('returns instance override when set');
  test('returns garden default when no instance override');
  test('returns library default when no garden default');
  test('handles null values correctly');
});
```

**Storage Functions**:
```javascript
describe('Garden Plant Storage', () => {
  test('saves plant with all new fields');
  test('loads plant with null overrides');
  test('updates individual fields');
  test('migrates existing plants on load');
});

describe('Garden Defaults Storage', () => {
  test('saves default for plant type');
  test('loads default for plant type');
  test('returns null for unset plant type');
  test('clears default correctly');
});
```

### 7.2 Component Tests

**PlantForm**:
```javascript
describe('PlantForm', () => {
  test('renders add mode with empty fields');
  test('renders edit mode with pre-populated values');
  test('shows advanced section when expanded');
  test('updates harvest preview when plant date changes');
  test('validates days to maturity is positive');
  test('validates space per plant is positive');
  test('submits with all fields');
});
```

**OverrideIndicator**:
```javascript
describe('OverrideIndicator', () => {
  test('shows calculated icon when isOverride=false');
  test('shows manual icon when isOverride=true');
  test('shows tooltip on hover');
});
```

**PlantCard**:
```javascript
describe('PlantCard', () => {
  test('displays variety after plant name');
  test('hides variety section when null');
  test('shows harvest date with countdown');
  test('shows override indicator for harvest date');
  test('shows space usage with override indicator');
  test('calls onEdit when Edit clicked');
});
```

### 7.3 Integration Tests

```javascript
describe('Enhanced Plant Properties Integration', () => {
  test('add plant → view card → shows calculated harvest');
  test('add plant with override → shows manual indicator');
  test('edit plant date → recalculates harvest');
  test('edit plant date (overridden harvest) → keeps override');
  test('set garden default → new plant uses default');
  test('set garden default → existing plant unchanged');
  test('override space → bed capacity updates');
});
```

### 7.4 Coverage Requirements

- **Minimum Coverage**: 100% (enforced by Vitest config)
- **Target Areas**:
  - All calculation functions: 100%
  - All storage operations: 100%
  - All components: 100%
  - Edge cases: leap years, nulls, large plants

---

## 8. Appendix

### 8.1 Glossary

| Term | Definition |
|------|------------|
| **Variety** | Specific cultivar of a plant (e.g., "Cherokee Purple" tomato) |
| **Days to Maturity** | Number of days from planting to expected harvest |
| **Squares Per Plant** | Space a plant needs in square feet (e.g., 1.0, 0.25) |
| **Plants Per Square** | Inverse of squaresPerPlant (how many fit in 1 sq ft) |
| **Override** | User-specified value that replaces library default |
| **Garden Default** | User-specified default for all instances of a plant type |
| **Instance Override** | User-specified value for a single plant entry |
| **Succession Planting** | Planting same crop at intervals for continuous harvest |

### 8.2 Related Documents

- [Bed Management Feature Spec](./bed-management-feature-spec.md)
- [Indoor Plants & Pots Spec](./indoor-plants-and-pots-spec.md)
- [Mobile Responsiveness and Testing Spec](./mobile-responsiveness-and-testing-spec.md)

### 8.3 References

- **Square Foot Gardening**: Mel Bartholomew's SFG method
- **Days to Maturity**: Standard seed catalog measurement
- **Plant Library**: `/square-gardener/src/data/plantLibrary.js`

### 8.4 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-18 | Claude | Initial draft based on user requirements |

---

**Approvals**:
- [ ] Product Owner
- [ ] Engineering Lead
- [ ] QA Lead

**Next Steps**:
1. Review and approve specification
2. Estimate implementation effort
3. Schedule sprints
4. Begin Phase 1 development
