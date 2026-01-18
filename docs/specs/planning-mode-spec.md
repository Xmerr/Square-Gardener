# Planning Mode Specification

**Status**: Draft
**Version**: 1.0
**Last Updated**: 2026-01-18
**Author**: Claude
**Stakeholders**: Square Gardener Users, Development Team

---

## 1. Overview

### 1.1 Problem Statement

Square Gardener users currently add plants to their garden beds without guidance on optimal placement. This leads to several issues:

- **Suboptimal plant placement**: Users may unknowingly place incompatible plants (enemies) next to each other, reducing yields
- **Missed companion benefits**: Users don't know which plants benefit from being adjacent, losing potential synergies
- **No planting schedule guidance**: Users must research optimal planting times for their climate zone
- **Manual trial and error**: Users waste time experimenting with layouts instead of getting expert guidance

The plant library already contains companion and enemy plant data (`companionPlants`, `avoidPlants`) that isn't being utilized, and planting season data (`plantingSeason`) that could power schedule recommendations.

**Impact**: Gardeners get lower yields and more pest/disease problems due to poor plant placement. New gardeners especially lack the knowledge to plan effectively.

### 1.2 Goals

1. **Auto-generate optimal layouts**: Create suggested grid layouts that maximize companion relationships and avoid enemy adjacencies
2. **Provide planting schedules**: Generate timeline-based planting schedules using frost dates and season data
3. **Work with existing gardens**: Plan around plants already in beds, not just empty beds
4. **Enable user customization**: Allow users to lock squares, edit suggestions, then apply to garden
5. **Explain recommendations**: Show reasoning for placement decisions to educate users
6. **Support planning workflow**: Apply plans to garden, export/print for reference

### 1.3 Non-Goals

- **Crop rotation**: Not suggesting what to plant after current crops finish (future enhancement)
- **Yield estimates**: Not calculating expected harvest amounts (future enhancement)
- **Weather integration**: Not adjusting for real-time weather forecasts
- **Pot planning**: Planning Mode only works with garden beds, not pots
- **Multi-year planning**: Not planning across multiple growing seasons
- **Automated planting reminders**: Not sending notifications (future enhancement)
- **Seed inventory tracking**: Not tracking what seeds user has available

---

## 2. Background

### 2.1 Context

**Companion Planting** is the practice of growing certain plants near each other for mutual benefit:
- Pest control (marigolds repel aphids from tomatoes)
- Pollination (flowers attract bees to vegetable gardens)
- Nutrient sharing (nitrogen-fixing beans help corn)
- Space efficiency (shallow + deep roots don't compete)

**Enemy Plants** are those that inhibit each other's growth:
- Chemical inhibition (allelopathy)
- Pest/disease sharing
- Resource competition

**Planting Schedules** depend on:
- Last spring frost date (when it's safe to plant warm-season crops)
- First fall frost date (deadline for fall planting)
- Plant-specific timing (some planted in spring, others in fall)

### 2.2 Current State

**Plant Library (plantLibrary.js)**:
- 31 plants with companion/enemy relationships defined
- `companionPlants`: Array of plant IDs that grow well nearby
- `avoidPlants`: Array of plant IDs that should be kept apart
- `plantingSeason`: Array of seasons ['spring', 'summer', 'fall']
- `daysToMaturity`: Used for harvest timing

**Bed Management** (pending):
- Beds with width/height dimensions
- Plants assigned to beds with quantity
- Capacity tracking per bed

**Current Utilities**:
- `getCompanionPlants(plantId)`: Returns companion plant objects
- `arePlantsCompatible(plantId1, plantId2)`: Checks if plants are NOT enemies

### 2.3 Prior Art

**Related Features**:
- Bed Management provides the beds and capacity data
- Enhanced Plant Properties provides variety and override data
- Indoor Plants & Pots spec explicitly excludes pots from Planning Mode

**External Inspiration**:
- Garden planning apps like GrowVeg, Garden Planner
- USDA Plant Hardiness Zone data for frost dates

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR1: Planning Mode Entry
- **FR1.1**: Dedicated "Planning" tab in main navigation
- **FR1.2**: Planning Mode is a separate view from My Garden
- **FR1.3**: Only garden beds are available for planning (pots excluded)
- **FR1.4**: User can select one or multiple beds to plan

#### FR2: Frost Date Configuration
- **FR2.1**: Users can manually enter last spring frost date
- **FR2.2**: Users can manually enter first fall frost date
- **FR2.3**: Optional: Enter ZIP code to auto-fill frost dates from USDA data
- **FR2.4**: Frost dates stored in user settings (persistent)
- **FR2.5**: Planning Mode prompts for frost dates if not set

#### FR3: Plant Selection
- **FR3.1**: Users select which plants they want to grow from plant library
- **FR3.2**: Selection UI shows plant name, space requirement, season
- **FR3.3**: Users specify quantity for each selected plant
- **FR3.4**: Running total shows space required vs space available
- **FR3.5**: Planning is BLOCKED if total space required exceeds available space
- **FR3.6**: User must reduce selection to fit before generating plan

#### FR4: Square Locking
- **FR4.1**: Users can lock individual squares in a bed's grid
- **FR4.2**: Locked squares can be: existing plants, paths, structures, reserved space
- **FR4.3**: Existing plants in the bed are automatically locked
- **FR4.4**: Locked squares are excluded from available planning space
- **FR4.5**: Locked squares visually distinguished (e.g., hatched pattern, lock icon)

#### FR5: Auto-Arrange Algorithm
- **FR5.1**: System automatically generates optimal plant placement
- **FR5.2**: **Priority 1**: Never place enemy plants in adjacent squares (including diagonal)
- **FR5.3**: **Priority 2**: Place companion plants in adjacent squares when possible
- **FR5.4**: **Priority 3**: Efficiently fill available space
- **FR5.5**: Algorithm respects locked squares
- **FR5.6**: Algorithm accounts for plant size (squaresPerPlant)
- **FR5.7**: Large plants (>1 sq ft) span multiple adjacent squares

#### FR6: Visual Grid Output
- **FR6.1**: Display grid layout for each planned bed
- **FR6.2**: Grid squares show plant icon/color
- **FR6.3**: Plant density shown with number badge (e.g., "4" for 4 carrots per square)
- **FR6.4**: Locked squares show lock indicator
- **FR6.5**: Large plants visually span multiple squares
- **FR6.6**: Grid is interactive (can click squares for details)
- **FR6.7**: Legend shows all plants in the plan with colors/icons

#### FR7: Placement Reasoning
- **FR7.1**: Each placement decision includes reasoning
- **FR7.2**: Reasoning displayed on hover/tap (tooltip or panel)
- **FR7.3**: Examples: "Basil placed next to Tomato (companions)", "Kept away from Cabbage (enemies)"
- **FR7.4**: Summary of relationships at bottom of grid

#### FR8: Planting Schedule
- **FR8.1**: Generate timeline/calendar showing when to plant each selected plant
- **FR8.2**: Timeline based on frost dates and plant's `plantingSeason`
- **FR8.3**: Spring plants: Show planting window after last frost
- **FR8.4**: Fall plants: Show planting window before first frost (with enough days to mature)
- **FR8.5**: Visual timeline with plant icons at their planting dates
- **FR8.6**: Grouped by month or season for clarity

#### FR9: Plan Editing
- **FR9.1**: User can adjust the generated plan before applying
- **FR9.2**: Drag-and-drop plants to different squares
- **FR9.3**: System shows warning if edit creates enemy adjacency
- **FR9.4**: System shows positive feedback if edit creates companion adjacency
- **FR9.5**: "Regenerate" button creates new arrangement from same selections

#### FR10: Apply Plan to Garden
- **FR10.1**: "Apply to Garden" button adds all planned plants to My Garden
- **FR10.2**: Plants added with: selected variety (if specified), suggested plant date, bed assignment, quantity
- **FR10.3**: Plants respect the grid position (for future grid-based tracking)
- **FR10.4**: Confirmation dialog shows summary before applying
- **FR10.5**: Option to apply specific plants or all plants

#### FR11: Export/Print Plan
- **FR11.1**: Export plan as printable view
- **FR11.2**: Print includes: grid layout, plant legend, planting schedule, reasoning summary
- **FR11.3**: Optimized for printing (no interactive elements, clear labels)
- **FR11.4**: Option to save as PDF (browser print-to-PDF)

#### FR12: Plan Persistence
- **FR12.1**: Plans are auto-saved as user works
- **FR12.2**: User can name and save multiple plans
- **FR12.3**: Plans can be loaded and edited later
- **FR12.4**: Plans marked as "Applied" after adding to garden

### 3.2 Non-Functional Requirements

#### NFR1: Performance
- **NFR1.1**: Auto-arrange algorithm completes in <2 seconds for typical beds (up to 8x8)
- **NFR1.2**: Grid renders in <500ms
- **NFR1.3**: Drag-and-drop feels responsive (<100ms feedback)
- **NFR1.4**: Algorithm scales reasonably for large beds (up to 20x20)

#### NFR2: Usability
- **NFR2.1**: Clear workflow: Select plants → Arrange → Review → Apply
- **NFR2.2**: Error prevention: Can't generate plan that won't fit
- **NFR2.3**: Undo support for editing actions
- **NFR2.4**: Mobile-responsive grid (touch-friendly)

#### NFR3: Algorithm Quality
- **NFR3.1**: Zero enemy adjacencies in generated plans (strict requirement)
- **NFR3.2**: Maximize companion adjacencies given constraints
- **NFR3.3**: Deterministic: Same inputs produce same outputs
- **NFR3.4**: Fallback: If no valid arrangement exists, explain why

#### NFR4: Testing
- **NFR4.1**: Maintain 100% test coverage
- **NFR4.2**: Algorithm has extensive unit tests for edge cases
- **NFR4.3**: Test cases: all companions, all enemies, mixed, single plant, full bed

### 3.3 Constraints

- **C1**: Must use existing plant library companion/enemy data
- **C2**: Must integrate with Bed Management (bed dimensions, existing plants)
- **C3**: Pots are explicitly excluded (handled separately if ever)
- **C4**: Must work offline (frost date lookup cached or manual entry)
- **C5**: Must follow existing Tailwind design system
- **C6**: Algorithm must handle beds up to 20x20 (400 squares)

### 3.4 Assumptions

- **A1**: Users understand basic companion planting concepts (or will learn via tooltips)
- **A2**: Frost dates are reasonably accurate (user responsibility)
- **A3**: Plant library companion/enemy data is accurate
- **A4**: Users will primarily plan at start of season (spring or fall)
- **A5**: Most beds are 4x4 to 8x8 (typical SFG sizes)

---

## 4. Design

### 4.1 Data Model

#### User Settings (frost dates)
```javascript
// Storage key: 'square-gardener-settings'
{
  frostDates: {
    lastSpringFrost: string | null,   // ISO date: '2026-04-15'
    firstFallFrost: string | null,    // ISO date: '2026-10-15'
    zipCode: string | null            // For auto-lookup
  }
}
```

#### Plan Schema
```javascript
// Storage key: 'square-gardener-plans'
{
  id: string,                    // 'plan-{timestamp}-{random}'
  name: string,                  // User-defined name
  bedId: string,                 // Reference to bed being planned
  status: 'draft' | 'applied',   // Whether plan has been applied to garden

  // Selection
  selectedPlants: [
    {
      plantId: string,           // Reference to plant library
      quantity: number,          // How many of this plant
      variety: string | null     // Optional variety name
    }
  ],

  // Locked squares
  lockedSquares: [
    {
      row: number,
      col: number,
      reason: 'existing_plant' | 'path' | 'structure' | 'reserved',
      plantId: string | null     // If locked by existing plant
    }
  ],

  // Generated arrangement
  arrangement: [
    {
      plantId: string,
      row: number,
      col: number,
      quantity: number,          // Plants in this square (for small plants)
      reasoning: string          // Why placed here
    }
  ],

  // Planting schedule
  schedule: [
    {
      plantId: string,
      plantingWindow: {
        start: string,           // ISO date
        end: string              // ISO date
      }
    }
  ],

  createdAt: string,
  updatedAt: string
}
```

#### Adjacency Definition
```
Adjacent squares include all 8 neighbors (including diagonals):

  [1][2][3]
  [4][X][5]
  [6][7][8]

For enemy checking, squares 1-8 are ALL checked relative to X.
```

### 4.2 Algorithm Design

#### Auto-Arrange Algorithm (Constraint Satisfaction)

```javascript
function generateArrangement(bed, selectedPlants, lockedSquares) {
  // 1. Build available squares grid
  const grid = createGrid(bed.width, bed.height);
  markLockedSquares(grid, lockedSquares);

  // 2. Sort plants by constraint difficulty
  // Plants with more enemies are harder to place → place first
  const sortedPlants = sortByConstraintDifficulty(selectedPlants);

  // 3. Place each plant using backtracking
  const arrangement = [];
  for (const plant of sortedPlants) {
    const positions = findValidPositions(grid, plant, arrangement);

    if (positions.length === 0) {
      throw new Error(`Cannot place ${plant.name}: no valid positions`);
    }

    // Score positions by companion adjacency
    const scoredPositions = positions.map(pos => ({
      ...pos,
      score: countCompanionAdjacencies(pos, arrangement, plant)
    }));

    // Select best position
    const bestPosition = selectBest(scoredPositions);
    arrangement.push({
      plantId: plant.id,
      ...bestPosition,
      reasoning: generateReasoning(bestPosition, arrangement)
    });

    // Mark grid squares as used
    markUsed(grid, bestPosition, plant.squaresPerPlant);
  }

  return arrangement;
}

function isValidPosition(grid, row, col, plant, arrangement) {
  // Check: square is available
  if (!grid[row][col].available) return false;

  // Check: no enemy plants in adjacent squares
  const adjacentPlants = getAdjacentPlants(row, col, arrangement);
  for (const adj of adjacentPlants) {
    if (plant.avoidPlants.includes(adj.plantId)) {
      return false; // Enemy adjacent - REJECT
    }
  }

  return true;
}

function countCompanionAdjacencies(position, arrangement, plant) {
  let score = 0;
  const adjacentPlants = getAdjacentPlants(position.row, position.col, arrangement);
  for (const adj of adjacentPlants) {
    if (plant.companionPlants.includes(adj.plantId)) {
      score += 1; // Companion adjacent - BONUS
    }
  }
  return score;
}
```

#### Planting Schedule Algorithm

```javascript
function generateSchedule(selectedPlants, frostDates) {
  const schedule = [];

  for (const plant of selectedPlants) {
    const plantData = getPlantById(plant.plantId);
    const window = calculatePlantingWindow(plantData, frostDates);
    schedule.push({
      plantId: plant.plantId,
      plantingWindow: window
    });
  }

  return schedule.sort((a, b) => a.plantingWindow.start - b.plantingWindow.start);
}

function calculatePlantingWindow(plant, frostDates) {
  const { lastSpringFrost, firstFallFrost } = frostDates;

  if (plant.plantingSeason.includes('spring')) {
    // Spring planting: after last frost
    return {
      start: addDays(lastSpringFrost, 7),  // 1 week after last frost
      end: addDays(lastSpringFrost, 42)    // 6 weeks after last frost
    };
  }

  if (plant.plantingSeason.includes('fall')) {
    // Fall planting: enough time to mature before first frost
    const plantByDate = subtractDays(firstFallFrost, plant.daysToMaturity + 14);
    return {
      start: subtractDays(plantByDate, 21), // 3 weeks before deadline
      end: plantByDate
    };
  }

  // Summer planting (rare): between frosts
  return {
    start: addDays(lastSpringFrost, 60),
    end: subtractDays(firstFallFrost, plant.daysToMaturity)
  };
}
```

### 4.3 Component Architecture

#### New Components

**PlanningPage.jsx** (Main Container)
- Manages planning workflow state
- Coordinates sub-components
- Handles plan save/load
- Location: `src/pages/PlanningPage.jsx`

**FrostDateForm.jsx**
- Manual entry for frost dates
- ZIP code lookup (optional)
- Saves to user settings
- Location: `src/components/FrostDateForm.jsx`

**PlantSelector.jsx**
- Multi-select from plant library
- Quantity input per plant
- Space calculator (required vs available)
- Block action if over capacity
- Location: `src/components/PlantSelector.jsx`

**PlanningGrid.jsx**
- Visual grid display for bed
- Shows plant arrangement
- Click for placement details
- Drag-and-drop editing
- Location: `src/components/PlanningGrid.jsx`

**SquareDetails.jsx**
- Popup/panel showing square contents
- Placement reasoning
- Companion/enemy indicators
- Location: `src/components/SquareDetails.jsx`

**PlantingTimeline.jsx**
- Timeline/calendar visualization
- Shows planting windows per plant
- Grouped by month
- Location: `src/components/PlantingTimeline.jsx`

**PlanSummary.jsx**
- Summary panel for completed plan
- Apply to Garden button
- Export/Print button
- Relationship summary
- Location: `src/components/PlanSummary.jsx`

**PrintablePlan.jsx**
- Print-optimized layout
- Grid + legend + schedule + reasoning
- Location: `src/components/PrintablePlan.jsx`

### 4.4 UI Design

#### Planning Page Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Planning Mode                                     [Save] [Load]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│ │ Step 1: Select Bed       │  │ Frost Dates                   │ │
│ │ [▼ Main Garden (4x4)   ] │  │ Last Spring: Apr 15, 2026     │ │
│ │                          │  │ First Fall: Oct 15, 2026      │ │
│ │ Available: 14/16 sq ft   │  │ [Edit Dates]                  │ │
│ └──────────────────────────┘  └──────────────────────────────┘ │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Step 2: Select Plants                                       │  │
│ │ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │  │
│ │ │ [x] Tomato       │ │ [x] Basil        │ │ [ ] Cabbage  │ │  │
│ │ │ Qty: [4]  1/sqft │ │ Qty: [8]  4/sqft │ │     1/sqft   │ │  │
│ │ └──────────────────┘ └──────────────────┘ └──────────────┘ │  │
│ │                                                             │  │
│ │ Space Required: 6 sq ft │ Available: 14 sq ft  ✅          │  │
│ │                                      [Generate Plan]        │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Generated Plan View
```
┌─────────────────────────────────────────────────────────────────┐
│ Generated Plan: Main Garden                        [Regenerate]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Grid Layout                    │  Legend                       │
│  ┌───┬───┬───┬───┐             │  🍅 Tomato (4)                │
│  │🍅 │🍅 │🌿4│🔒 │             │  🌿 Basil (8)                 │
│  ├───┼───┼───┼───┤             │  🔒 Locked (existing plant)   │
│  │🍅 │🍅 │🌿4│🌿4│             │                                │
│  ├───┼───┼───┼───┤             │  Relationships:               │
│  │   │   │   │   │             │  ✅ Basil + Tomato: Companions│
│  ├───┼───┼───┼───┤             │  ❌ No enemy adjacencies      │
│  │   │   │   │   │             │                                │
│  └───┴───┴───┴───┘             │                                │
│                                                                  │
│  Click any square for placement details                         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Planting Schedule                                                │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ Apr          May          Jun          Jul          Aug     │  │
│ │  |──────────────|                                           │  │
│ │  🍅 Tomato                                                  │  │
│ │      |──────────────|                                       │  │
│ │      🌿 Basil                                               │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│                      [Edit Plan]  [Apply to Garden]  [Print]    │
└─────────────────────────────────────────────────────────────────┘
```

#### Square Details Popup
```
┌─────────────────────────────────┐
│ Square (2, 3)                   │
├─────────────────────────────────┤
│ 🌿 Basil × 4                    │
│                                 │
│ Placement Reasoning:            │
│ • Adjacent to Tomato (companion)│
│ • Away from Sage (enemy)        │
│                                 │
│ [Move]  [Swap]  [Remove]        │
└─────────────────────────────────┘
```

#### Space Overflow Error
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ Cannot Generate Plan                             │
├─────────────────────────────────────────────────────┤
│ Selected plants require 18 sq ft, but only          │
│ 14 sq ft is available in Main Garden.               │
│                                                     │
│ Options:                                            │
│ • Remove some plants                                │
│ • Reduce quantities                                 │
│ • Select a larger bed                               │
│ • Unlock some squares                               │
│                                                     │
│                               [OK]                  │
└─────────────────────────────────────────────────────┘
```

### 4.5 ZIP Code Frost Date Lookup

For the optional ZIP code lookup feature:

```javascript
// Simplified frost date data (subset of USDA zones)
const FROST_DATE_DATA = {
  // Format: ZIP prefix → { lastSpring, firstFall }
  '100': { lastSpring: '04-15', firstFall: '10-15' }, // NYC area
  '900': { lastSpring: '02-15', firstFall: '12-15' }, // LA area
  '606': { lastSpring: '04-20', firstFall: '10-10' }, // Chicago
  // ... more regions
};

function lookupFrostDates(zipCode) {
  const prefix = zipCode.substring(0, 3);
  const data = FROST_DATE_DATA[prefix];

  if (!data) {
    return null; // Fallback to manual entry
  }

  const currentYear = new Date().getFullYear();
  return {
    lastSpringFrost: `${currentYear}-${data.lastSpring}`,
    firstFallFrost: `${currentYear}-${data.firstFall}`
  };
}
```

Note: Full implementation would use a more comprehensive dataset or external API.

### 4.6 Alternatives Considered

**Alternative 1: Real-Time Drag-and-Drop Only**
- No auto-arrangement, user places manually
- **Rejected**: Misses key value proposition; users want guidance

**Alternative 2: Strict Companion Requirements**
- Only generate plans where ALL companions are adjacent
- **Rejected**: Often impossible; companions are a bonus, not requirement

**Alternative 3: Genetic Algorithm for Optimization**
- More sophisticated optimization
- **Rejected**: Overkill for typical bed sizes; constraint satisfaction is sufficient

**Alternative 4: Include Pots in Planning**
- Allow pot arrangement planning
- **Rejected**: Pots are simpler, don't follow grid pattern; adds complexity

**Alternative 5: Per-Bed Planning Button**
- Plan from bed card instead of dedicated page
- **Rejected**: Dedicated Planning tab provides better focused experience

### 4.7 Open Questions

1. **Q**: Should ZIP lookup use external API or bundled data?
   **A**: Start with bundled data for major regions; API can be added later

2. **Q**: How to handle plants that span multiple squares visually?
   **A**: Connect squares with shared border styling, show as single "unit"

3. **Q**: Should plans be shareable with other users?
   **A**: Out of scope for MVP; plans are user-local

4. **Q**: What happens if user changes bed dimensions after creating a plan?
   **A**: Mark plan as "needs update", prompt to regenerate

---

## 5. Implementation

### 5.1 Implementation Phases

#### Phase 1: Core Infrastructure
**Tasks**:
1. Create user settings storage (frost dates)
2. Create plan storage CRUD operations
3. Implement adjacency detection utilities
4. Create basic constraint-checking functions
5. Write unit tests for all utilities

**Acceptance Criteria**:
- Frost dates persist across sessions
- Plans can be saved and loaded
- Adjacency correctly identifies all 8 neighbors

#### Phase 2: Planning Page & Selection
**Tasks**:
1. Create PlanningPage component shell
2. Create FrostDateForm component
3. Implement ZIP code lookup (bundled data)
4. Create PlantSelector component
5. Implement space calculator (required vs available)
6. Block generation when over capacity
7. Write component tests

**Acceptance Criteria**:
- Users can set frost dates
- Users can select plants with quantities
- Cannot proceed if plants don't fit

#### Phase 3: Auto-Arrange Algorithm
**Tasks**:
1. Implement constraint satisfaction algorithm
2. Handle plant size (squaresPerPlant) in placement
3. Generate placement reasoning
4. Handle edge cases (no valid arrangement)
5. Write extensive algorithm tests

**Acceptance Criteria**:
- Algorithm produces valid arrangements
- No enemy adjacencies in any output
- Companion adjacencies maximized
- Performance <2s for 8x8 beds

#### Phase 4: Visual Grid
**Tasks**:
1. Create PlanningGrid component
2. Implement plant icons/colors with density badges
3. Create SquareDetails popup
4. Add locked square visualization
5. Handle large plants spanning squares
6. Write component tests

**Acceptance Criteria**:
- Grid accurately shows arrangement
- Clicking squares shows details
- Locked squares clearly visible

#### Phase 5: Planting Schedule
**Tasks**:
1. Implement schedule calculation algorithm
2. Create PlantingTimeline component
3. Visual timeline with plant icons
4. Group by month/season
5. Write component tests

**Acceptance Criteria**:
- Schedule respects frost dates
- Timeline is readable and accurate
- All selected plants have planting windows

#### Phase 6: Plan Editing
**Tasks**:
1. Implement drag-and-drop in grid
2. Add validation warnings on edit
3. Create "Regenerate" functionality
4. Add undo support
5. Write interaction tests

**Acceptance Criteria**:
- Drag-and-drop moves plants
- Warnings shown for enemy adjacencies
- Regenerate creates new valid arrangement

#### Phase 7: Apply & Export
**Tasks**:
1. Implement "Apply to Garden" flow
2. Create confirmation dialog
3. Create PrintablePlan component
4. Implement export/print functionality
5. Mark plans as "Applied"
6. Write integration tests

**Acceptance Criteria**:
- Apply adds plants to garden correctly
- Print layout is clean and complete
- Applied plans marked in UI

### 5.2 Dependencies

**Internal**:
- Bed Management feature (beds, dimensions, existing plants)
- Plant library companion/enemy data
- Storage infrastructure

**External**:
- None required (ZIP lookup uses bundled data)

**Blocking**:
- Bed Management should be complete first (for bed data)

### 5.3 Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Algorithm can't find valid arrangement | High | Medium | Clear error message, suggest removing plants with many enemies |
| Performance issues with large beds | Medium | Low | Optimize algorithm, set max bed size limit |
| ZIP frost data incomplete | Low | Medium | Fall back to manual entry, expand data over time |
| Users confused by workflow | Medium | Medium | Clear step-by-step UI, help tooltips |
| Companion/enemy data inaccurate | Medium | Low | Allow user to report issues, iterate on data |

---

## 6. Success Criteria

### 6.1 Acceptance Criteria

**Frost Dates**:
- [ ] Users can enter frost dates manually
- [ ] ZIP code lookup provides frost dates
- [ ] Frost dates persist across sessions

**Plant Selection**:
- [ ] Users can select multiple plants
- [ ] Quantity input works correctly
- [ ] Space calculator shows required vs available
- [ ] Generation blocked when over capacity

**Auto-Arrange**:
- [ ] Algorithm generates valid arrangements
- [ ] Zero enemy adjacencies in all outputs
- [ ] Companion adjacencies are maximized
- [ ] Locked squares are respected
- [ ] Large plants span multiple squares correctly

**Visual Grid**:
- [ ] Grid displays arrangement clearly
- [ ] Density badges show plant count
- [ ] Square details show reasoning
- [ ] Locked squares are visually distinct

**Planting Schedule**:
- [ ] Timeline shows planting windows
- [ ] Schedule respects frost dates and plant seasons
- [ ] Visual timeline is readable

**Plan Editing**:
- [ ] Drag-and-drop works
- [ ] Enemy warnings shown on invalid edits
- [ ] Regenerate creates new arrangement

**Apply & Export**:
- [ ] Apply adds plants to garden
- [ ] Confirmation dialog shows summary
- [ ] Print layout is complete and clean
- [ ] Plans marked as applied

### 6.2 Key Metrics

**Usage Metrics**:
- 50%+ of users try Planning Mode
- 70%+ of generated plans are applied to garden
- Average 3+ plants selected per plan

**Quality Metrics**:
- 100% of generated plans have zero enemy adjacencies
- 80%+ of generated plans have companion adjacencies
- <5% of users report algorithm failures

**Performance Metrics**:
- Algorithm <2s for beds up to 8x8
- Algorithm <10s for beds up to 20x20

### 6.3 Success Definition

This feature is successful if:
1. **Users adopt Planning Mode**: Majority of active users try it
2. **Plans get applied**: Most generated plans are used
3. **Zero invalid plans**: Algorithm never produces enemy adjacencies
4. **Users learn**: Reasoning helps users understand companion planting
5. **Schedule accuracy**: Users report planting at suggested times works well

---

## 7. Test Plan

### 7.1 Unit Tests

**Algorithm Tests**:
```javascript
describe('Auto-Arrange Algorithm', () => {
  describe('Enemy Avoidance', () => {
    test('never places enemies adjacent horizontally');
    test('never places enemies adjacent vertically');
    test('never places enemies adjacent diagonally');
    test('handles plants with many enemies');
    test('throws error when no valid arrangement possible');
  });

  describe('Companion Placement', () => {
    test('places companions adjacent when possible');
    test('maximizes companion adjacencies');
    test('companions are bonus, not required');
  });

  describe('Space Handling', () => {
    test('respects locked squares');
    test('handles squaresPerPlant < 1 (multiple per square)');
    test('handles squaresPerPlant > 1 (spans squares)');
    test('fills available space efficiently');
  });

  describe('Edge Cases', () => {
    test('single plant in large bed');
    test('bed completely full');
    test('all plants are companions');
    test('all plants are enemies');
    test('20x20 bed performance');
  });
});

describe('Schedule Algorithm', () => {
  test('spring plants: after last frost');
  test('fall plants: before first frost minus maturity days');
  test('handles plants with multiple seasons');
  test('handles missing frost dates gracefully');
});
```

**Storage Tests**:
```javascript
describe('Plan Storage', () => {
  test('saves plan with all fields');
  test('loads plan correctly');
  test('updates plan status');
  test('handles multiple plans');
  test('deletes plan');
});

describe('Frost Date Storage', () => {
  test('saves frost dates');
  test('loads frost dates');
  test('ZIP lookup returns correct dates');
  test('ZIP lookup returns null for unknown ZIP');
});
```

### 7.2 Component Tests

**PlanningGrid**:
```javascript
describe('PlanningGrid', () => {
  test('renders grid with correct dimensions');
  test('displays plant icons in correct squares');
  test('shows density badges for small plants');
  test('shows locked square indicators');
  test('shows large plant spanning squares');
  test('calls onSquareClick when clicked');
  test('handles drag and drop');
});
```

**PlantSelector**:
```javascript
describe('PlantSelector', () => {
  test('lists all available plants');
  test('allows selecting multiple plants');
  test('quantity inputs work');
  test('shows space required calculation');
  test('shows error when over capacity');
  test('disables generate button when over capacity');
});
```

**PlantingTimeline**:
```javascript
describe('PlantingTimeline', () => {
  test('renders timeline with months');
  test('shows planting windows for each plant');
  test('handles plants with different seasons');
  test('groups by month correctly');
});
```

### 7.3 Integration Tests

```javascript
describe('Planning Mode Integration', () => {
  test('full workflow: select plants → generate → apply to garden');
  test('editing plan and regenerating');
  test('planning around existing plants');
  test('locking squares and replanning');
  test('export/print generates correct output');
});
```

### 7.4 Coverage Requirements

- **Minimum Coverage**: 100% (enforced by Vitest config)
- **Target Areas**:
  - Algorithm functions: 100%
  - Component rendering: 100%
  - Edge cases: exhaustive testing

---

## 8. Appendix

### 8.1 Glossary

| Term | Definition |
|------|------------|
| **Companion Plants** | Plants that benefit from growing near each other |
| **Enemy Plants** | Plants that inhibit each other's growth (avoidPlants) |
| **Adjacent** | Any of the 8 squares surrounding a given square (including diagonals) |
| **Frost Dates** | Last spring frost and first fall frost dates for a location |
| **Planting Window** | Date range when a plant should be planted |
| **Locked Square** | Grid square excluded from planning (existing plant, path, etc.) |
| **Constraint Satisfaction** | Algorithm approach that finds solutions meeting all constraints |

### 8.2 Companion/Enemy Examples

**Good Companions**:
- Tomato + Basil (pest deterrent, flavor enhancement)
- Carrot + Onion (pest confusion)
- Corn + Bean + Squash ("Three Sisters")

**Enemy Plants**:
- Tomato + Cabbage (growth inhibition)
- Bean + Onion (chemical interference)
- Cucumber + Potato (disease sharing)

### 8.3 Related Documents

- [Bed Management Feature Spec](./bed-management-feature-spec.md)
- [Enhanced Plant Properties Spec](./enhanced-plant-properties-spec.md)
- [Indoor Plants & Pots Spec](./indoor-plants-and-pots-spec.md)
- [Mobile Responsiveness and Testing Spec](./mobile-responsiveness-and-testing-spec.md)

### 8.4 References

- **Companion Planting**: Traditional gardening practice documented in plant library
- **USDA Plant Hardiness Zones**: Source for frost date approximations
- **Square Foot Gardening**: Mel Bartholomew's grid-based method

### 8.5 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-18 | Claude | Initial draft based on user requirements |

---

**Approvals**:
- [ ] Product Owner
- [ ] Engineering Lead
- [ ] QA Lead
- [ ] UX Designer

**Next Steps**:
1. Review and approve specification
2. Validate companion/enemy data completeness
3. Estimate implementation effort
4. Schedule sprints
5. Begin Phase 1 development
