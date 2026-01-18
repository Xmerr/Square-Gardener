# Bed Management Feature Specification

**Status**: Draft
**Version**: 1.0
**Last Updated**: 2026-01-18
**Author**: Claude
**Stakeholders**: Square Gardener Users, Development Team

---

## 1. Overview

### 1.1 Problem Statement

The current Square Gardener MVP allows users to add plants to "My Garden" without any spatial organization or capacity tracking. Users cannot:
- Organize plants into physical garden beds
- Track space utilization per bed
- Understand if they're overcrowding their gardens
- Visualize their garden layout
- Manage multiple growing locations

This lack of spatial organization makes it difficult for users to follow Square Foot Gardening (SFG) principles and plan realistic gardens.

### 1.2 Goals

1. **Enable bed creation and management**: Allow users to create, edit, delete, and reorder garden beds
2. **Enforce spatial awareness**: Track capacity and warn users when beds are overcrowded
3. **Improve plant organization**: Require bed assignment for all plants to maintain structured data
4. **Provide visual feedback**: Show mini grid previews and capacity indicators for each bed
5. **Support flexible workflows**: Allow plant reassignment between beds and bulk operations

### 1.3 Non-Goals

- Advanced bed properties (location notes, bed types, soil conditions) - defer to future iterations
- Dimension validation/limits - trust users to enter reasonable values
- Automated bed layout optimization - handled by Planning Mode feature
- Companion planting integration in bed management - handled by Planning Mode feature
- Multi-user bed sharing or permissions

---

## 2. Background

### 2.1 Context

Square Foot Gardening (SFG) is a method that divides growing areas into 1-foot grid squares. Each square can hold a specific number of plants based on size:
- Large plants (tomatoes, peppers): 1 per square
- Medium plants (lettuce, beets): 4 per square (2×2 grid)
- Small plants (carrots, radishes): 9 per square (3×3 grid)
- Tiny plants (onions): 16 per square (4×4 grid)

The plant library already contains `squaresPerPlant` values for each plant type, making capacity calculations possible.

### 2.2 Current State

**Data Model (storage.js)**:
- Garden beds storage functions exist but are unused: `getGardenBeds()`, `saveGardenBeds()`
- No bed data structure is defined or populated
- Plants in `gardenPlants` have no bed association

**UI (MyGarden.jsx)**:
- Plants are displayed in a simple grid without grouping
- No spatial organization or capacity tracking
- No bed selection interface

**Plant Library (plantLibrary.js)**:
- 33 plants with `squaresPerPlant` values (0.0625 to 1)
- Values represent space requirements in SFG system

### 2.3 Prior Art

**Existing Spec Format**: Following `mobile-responsiveness-and-testing-spec.md` structure

**Related Features**:
- Planning Mode will build upon bed data to suggest layouts
- Enhanced My Garden will reference bed assignments
- Indoor plants (future) will use beds with "pot" designation

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR1: Bed Creation
- **FR1.1**: Users can create new garden beds with three required fields:
  - Name (string, non-empty)
  - Width (number, in feet)
  - Height (number, in feet)
- **FR1.2**: No minimum or maximum dimension constraints
- **FR1.3**: Users must create at least one bed before adding plants to garden
- **FR1.4**: New beds are added to the end of the user-defined order

#### FR2: Bed Display
- **FR2.1**: Beds are displayed in user-defined order
- **FR2.2**: Each bed shows:
  - Bed name
  - Dimensions (e.g., "4 ft × 4 ft")
  - Square footage (calculated: width × height)
  - Current capacity (e.g., "12.5 / 16 sq ft used")
  - Mini grid preview showing plant placement
  - Plant count
- **FR2.3**: Overcrowded beds display a visible warning indicator

#### FR3: Bed Capacity Calculation
- **FR3.1**: Capacity formula: `Total Capacity = width × height` (square feet)
- **FR3.2**: Used capacity formula: `Used Capacity = Σ(plant quantity ÷ plantsPerSquare)` for all plants in bed
  - Where `plantsPerSquare = 1 / squaresPerPlant`
- **FR3.3**: Bed is over-capacity when: `Used Capacity > Total Capacity`
- **FR3.4**: Capacity displayed with 1 decimal precision (e.g., "12.5 / 16.0 sq ft")

#### FR4: Overcapacity Warnings
- **FR4.1**: When adding a plant would exceed bed capacity:
  - Display warning message: "This bed is at capacity. Adding X [plant name] will use Y sq ft, but only Z sq ft remain."
  - Show "Add Anyway" button to allow override
  - Show "Cancel" button to abort operation
- **FR4.2**: Bed overview displays warning badge for overcrowded beds:
  - Visual indicator (e.g., red exclamation icon)
  - Tooltip: "This bed is overcrowded by X sq ft"
- **FR4.3**: Warnings are informational - users can always override

#### FR5: Plant Assignment
- **FR5.1**: Bed selection is required when adding a plant to garden
- **FR5.2**: Bed selector shows:
  - Bed name
  - Available capacity
  - Warning if selection would overcrowd
- **FR5.3**: If no beds exist, redirect user to "Create Bed" flow first

#### FR6: Plant Reassignment
- **FR6.1**: Users can move a single plant from one bed to another
- **FR6.2**: Users can select multiple plants and bulk reassign to a different bed
- **FR6.3**: Reassignment triggers capacity warnings if destination bed would be overcrowded
- **FR6.4**: Capacity recalculated for both source and destination beds

#### FR7: Bed Editing
- **FR7.1**: Users can edit all bed properties: name, width, height
- **FR7.2**: If dimension changes make bed over-capacity, show warning but allow save
- **FR7.3**: Editing recalculates capacity and updates all displays

#### FR8: Bed Deletion
- **FR8.1**: If bed contains no plants: immediate deletion with confirmation
- **FR8.2**: If bed contains plants: show dialog with options:
  - Dropdown to select destination bed for plants
  - Checkbox: "Delete all plants in this bed" (overrides dropdown)
  - Cancel button
- **FR8.3**: Cannot delete the last remaining bed if plants exist in garden
- **FR8.4**: After deletion, bed order is preserved for remaining beds

#### FR9: Bed Reordering
- **FR9.1**: Users can drag-and-drop beds to reorder
- **FR9.2**: Order is persisted in storage
- **FR9.3**: Reordering does not affect plant assignments or capacity

### 3.2 Non-Functional Requirements

#### NFR1: Performance
- **NFR1.1**: Capacity calculations complete in <50ms for beds with up to 100 plants
- **NFR1.2**: Mini grid preview renders in <100ms
- **NFR1.3**: Bed list loads in <200ms for up to 20 beds

#### NFR2: Usability
- **NFR2.1**: Bed creation form validates inputs in real-time
- **NFR2.2**: Capacity warnings use clear, non-technical language
- **NFR2.3**: Mini grid preview uses color coding for quick comprehension
- **NFR2.4**: Mobile-responsive design follows existing Tailwind breakpoints

#### NFR3: Data Integrity
- **NFR3.1**: Capacity calculations always match actual plant assignments
- **NFR3.2**: Deleting/editing beds never orphans plant data
- **NFR3.3**: All bed operations are atomic (complete or rollback)

#### NFR4: Accessibility
- **NFR4.1**: All form inputs have proper labels
- **NFR4.2**: Warning indicators have text alternatives
- **NFR4.3**: Drag-and-drop has keyboard alternative
- **NFR4.4**: Color-blind safe palette for capacity indicators

#### NFR5: Testing
- **NFR5.1**: Maintain 100% test coverage
- **NFR5.2**: All capacity calculations have unit tests
- **NFR5.3**: Edge cases covered: empty beds, overcrowded beds, zero dimensions, negative dimensions

### 3.3 Constraints

- **C1**: Must use existing sessionStorage API (no database migration in this iteration)
- **C2**: Must integrate with existing plant library `squaresPerPlant` values
- **C3**: Must not break existing My Garden functionality during rollout
- **C4**: Must follow existing Tailwind design system (green theme #2d6a4f)
- **C5**: Must maintain React 19 + Vite 7 architecture

### 3.4 Assumptions

- **A1**: Users understand Square Foot Gardening principles or will learn via tooltips
- **A2**: Users will enter bed dimensions in feet (no unit conversion needed)
- **A3**: Users want realistic capacity tracking (not aspirational)
- **A4**: Most users will have 1-5 beds; up to 20 beds is edge case
- **A5**: Fractional square footage is acceptable (e.g., "12.5 sq ft")

---

## 4. Design

### 4.1 Data Model

#### Bed Schema
```javascript
{
  id: string,              // 'bed-{timestamp}-{random}' (e.g., 'bed-1737216000000-abc123')
  name: string,            // User-defined name (e.g., 'Main Vegetable Bed')
  width: number,           // Width in feet (e.g., 4)
  height: number,          // Height in feet (e.g., 4)
  order: number,           // Display order (0-indexed)
  createdAt: string,       // ISO 8601 timestamp
  updatedAt: string        // ISO 8601 timestamp
}
```

#### Updated Garden Plant Schema
```javascript
{
  id: string,              // Existing: 'garden-{timestamp}-{random}'
  plantId: string,         // Existing: Reference to Plant Library
  bedId: string,           // NEW: Reference to Bed (required)
  quantity: number,        // NEW: Number of this plant (default: 1)
  plantedDate: string,     // Existing: ISO 8601 timestamp
  lastWatered: string,     // Existing: ISO 8601 timestamp
  notes: string            // Existing: User notes
}
```

#### Storage Operations (storage.js additions)
```javascript
// Beds
getGardenBeds()              // Returns Bed[]
saveGardenBeds(beds)         // Saves Bed[]
addGardenBed(name, width, height)  // Creates new bed
updateGardenBed(bedId, updates)    // Updates bed properties
removeGardenBed(bedId)       // Deletes bed
reorderBeds(bedIds)          // Updates order array

// Bed Utilities
getBedById(bedId)            // Returns single Bed
getBedCapacity(bedId)        // Returns { total, used, available, isOvercapacity }
getPlantsByBed(bedId)        // Returns GardenPlant[]
reassignPlant(gardenPlantId, newBedId)  // Moves plant to different bed
bulkReassignPlants(gardenPlantIds, newBedId)  // Moves multiple plants
```

### 4.2 Component Architecture

#### New Components

**BedManager.jsx** (Parent Component)
- Orchestrates bed list, creation, editing
- Manages bed reordering
- Handles bed deletion workflow
- Location: `src/components/BedManager.jsx`

**BedCard.jsx** (Bed Display)
- Displays single bed with properties
- Shows mini grid preview
- Shows capacity meter
- Shows overcapacity warning
- Edit/Delete actions
- Location: `src/components/BedCard.jsx`

**BedForm.jsx** (Creation/Editing)
- Input fields: name, width, height
- Real-time validation
- Submit/Cancel actions
- Location: `src/components/BedForm.jsx`

**BedGridPreview.jsx** (Visualization)
- Renders mini grid (max 10×10 visual)
- Shows plant icons/colors
- Shows empty squares
- Tooltip with plant details
- Location: `src/components/BedGridPreview.jsx`

**BedSelector.jsx** (Plant Assignment)
- Dropdown or modal for bed selection
- Shows capacity for each bed
- Filters out overcrowded beds (with override)
- Location: `src/components/BedSelector.jsx`

**BedDeleteDialog.jsx** (Deletion Confirmation)
- Lists plants in bed
- Destination bed selector
- "Delete all plants" checkbox
- Confirm/Cancel actions
- Location: `src/components/BedDeleteDialog.jsx`

#### Modified Components

**MyGarden.jsx**
- Add "Manage Beds" button/tab
- Update "Add Plant" flow to include BedSelector
- Group plants by bed in display
- Add bulk reassignment UI

**PlantCard.jsx**
- Add bed badge showing assigned bed
- Add "Move to..." action

**Home.jsx** (Dashboard)
- Add bed stats: "X Beds" with breakdown
- Add "Most crowded bed" widget

### 4.3 User Flows

#### Flow 1: First-Time User (No Beds Exist)
1. User clicks "Add Plant" in My Garden
2. System detects no beds exist
3. Redirect to "Create Your First Bed" modal
4. User enters: name="Main Garden", width=4, height=4
5. System creates bed and returns to "Add Plant" flow
6. User selects plant and bed is auto-selected (only one exists)

#### Flow 2: Creating Additional Beds
1. User clicks "Manage Beds" button in My Garden
2. BedManager displays current beds + "Add New Bed" button
3. User clicks "Add New Bed"
4. BedForm modal appears
5. User enters: name="Herb Garden", width=2, height=4
6. User clicks "Create Bed"
7. New bed appears at end of list

#### Flow 3: Adding Plant with Capacity Warning
1. User adds tomato plant (1 plant per square foot)
2. BedSelector shows: "Main Garden (15.5 / 16 sq ft used)"
3. User selects "Main Garden" and quantity=2
4. System calculates: 15.5 + 2 = 17.5 > 16
5. Warning modal: "This bed is at capacity. Adding 2 Tomato will use 2 sq ft, but only 0.5 sq ft remain."
6. User clicks "Add Anyway"
7. Plant added, bed shows overcapacity warning badge

#### Flow 4: Reassigning Plants
1. User views "Main Garden" (overcrowded)
2. User selects 3 lettuce plants (checkboxes)
3. User clicks "Move to..." dropdown
4. User selects "Herb Garden"
5. System checks Herb Garden capacity: OK
6. Plants moved, both beds recalculate capacity

#### Flow 5: Deleting Bed with Plants
1. User clicks "Delete" on "Herb Garden" bed
2. BedDeleteDialog shows: "Herb Garden contains 8 plants"
3. Dropdown shows: "Main Garden", "Side Bed"
4. User selects "Main Garden"
5. System checks if Main Garden can fit 8 plants: Shows warning if not
6. User clicks "Delete Bed"
7. 8 plants moved to Main Garden, Herb Garden deleted

#### Flow 6: Editing Bed Dimensions
1. User clicks "Edit" on "Main Garden"
2. BedForm pre-filled: name="Main Garden", width=4, height=4
3. User changes width=3 (new capacity: 3×4=12)
4. Current used capacity: 15.5 sq ft
5. Warning: "Changing dimensions will make this bed overcrowded (15.5 / 12 sq ft)"
6. User clicks "Save Anyway"
7. Bed updated, overcapacity warning appears

### 4.4 UI Design

#### Bed List Layout (Desktop)
```
┌─────────────────────────────────────────────────────────────┐
│ My Garden - Beds                          [+ Add New Bed]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ ⋮⋮ Main Vegetable Bed              [Edit] [Delete]  │    │
│ │    4 ft × 4 ft (16 sq ft)                            │    │
│ │    ━━━━━━━━━━━━━━━━━━━━ 12.5 / 16 sq ft used        │    │
│ │    [Mini Grid Preview]                               │    │
│ │    🌱 8 plants                                        │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                               │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ ⋮⋮ Herb Garden                      [Edit] [Delete]  │    │
│ │    2 ft × 4 ft (8 sq ft)              ⚠️ Overcrowded │    │
│ │    ━━━━━━━━━━━━━━━━━━━━ 9.5 / 8 sq ft used          │    │
│ │    [Mini Grid Preview]                               │    │
│ │    🌱 12 plants                                       │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Capacity Meter Design
```
Normal: ━━━━━━━━━━━━━━━━━━━━ 12.5 / 16 sq ft used
        [Green fill]

Full:   ━━━━━━━━━━━━━━━━━━━━ 16.0 / 16 sq ft used
        [Yellow fill]

Over:   ━━━━━━━━━━━━━━━━━━━━ 18.5 / 16 sq ft used
        [Red fill] ⚠️ Overcrowded by 2.5 sq ft
```

#### Mini Grid Preview (4×4 Bed Example)
```
┌─┬─┬─┬─┐
│🍅│🍅│🍅│🍅│  Legend:
├─┼─┼─┼─┤  🍅 Tomato
│🥬│🥬│🥬│🥬│  🥬 Lettuce (4 per square)
├─┼─┼─┼─┤  🥕 Carrot (9 per square)
│🥕│🥕│  │  │  □  Empty
├─┼─┼─┼─┤
│  │  │  │  │
└─┴─┴─┴─┘
```

For beds larger than 10×10, scale down or show representative sample.

#### Bed Selector (When Adding Plant)
```
┌───────────────────────────────────────────┐
│ Select Bed                                 │
├───────────────────────────────────────────┤
│ ○ Main Vegetable Bed                      │
│   12.5 / 16 sq ft used                    │
│                                            │
│ ○ Herb Garden                     ⚠️      │
│   9.5 / 8 sq ft used (overcrowded)        │
│                                            │
│ ○ Side Bed                                │
│   0 / 12 sq ft used                       │
│                                            │
│                    [Cancel]  [Add Plant]  │
└───────────────────────────────────────────┘
```

#### Overcapacity Warning Modal
```
┌──────────────────────────────────────────────┐
│ ⚠️  Bed Capacity Warning                     │
├──────────────────────────────────────────────┤
│ This bed is at capacity.                     │
│                                               │
│ Adding 2 Tomato will use 2.0 sq ft,          │
│ but only 0.5 sq ft remain.                   │
│                                               │
│ The bed will be overcrowded by 1.5 sq ft.    │
│                                               │
│                    [Cancel]  [Add Anyway]    │
└──────────────────────────────────────────────┘
```

### 4.5 Capacity Calculation Examples

**Example 1: 4×4 Bed with Mixed Plants**
```
Bed: 4 ft × 4 ft = 16 sq ft total

Plants:
- 4 Tomatoes (1 per sq ft) = 4 sq ft
- 8 Lettuce (4 per sq ft) = 2 sq ft
- 18 Carrots (9 per sq ft) = 2 sq ft
Total used: 8 sq ft
Available: 8 sq ft
Status: ✅ Normal
```

**Example 2: Overcrowded Bed**
```
Bed: 2 ft × 4 ft = 8 sq ft total

Plants:
- 6 Tomatoes (1 per sq ft) = 6 sq ft
- 12 Lettuce (4 per sq ft) = 3 sq ft
Total used: 9 sq ft
Available: -1 sq ft
Status: ⚠️ Overcrowded by 1 sq ft
```

**Example 3: Large Plants (More than 1 sq ft)**
```
Some plants are too large for 1 square foot:
- Squash: squaresPerPlant = 2 (needs 2 sq ft each)
- Pumpkin: squaresPerPlant = 4 (needs 4 sq ft each)

Bed: 8 ft × 4 ft = 32 sq ft total

Plants:
- 3 Pumpkins (4 sq ft each) = 12 sq ft
- 4 Squash (2 sq ft each) = 8 sq ft
- 8 Tomatoes (1 sq ft each) = 8 sq ft
Total used: 28 sq ft
Available: 4 sq ft
Status: ✅ Normal
```

### 4.6 Mobile Responsive Design

**Mobile (< 640px)**:
- Single column bed list
- Stacked bed properties
- Compact mini grid (4×4 max visual)
- Bottom sheet for BedSelector
- Full-screen modals for forms

**Tablet (640px - 1024px)**:
- 2-column bed grid
- Expanded mini grid previews
- Side panel for forms

**Desktop (> 1024px)**:
- 2-3 column bed grid (based on screen width)
- Full-size mini grids
- Modal overlays for forms

### 4.7 Alternatives Considered

**Alternative 1: No Required Bed Assignment**
- Allow plants without bed assignment initially
- Provide "Unassigned" virtual bed
- **Rejected**: Defeats purpose of spatial organization; technical debt

**Alternative 2: Strict Capacity Enforcement**
- Block adding plants when bed is full (no override)
- **Rejected**: Too restrictive; users may intentionally plant densely

**Alternative 3: Auto-Create Default Bed**
- Create "My Garden (4×4)" bed on first plant addition
- **Rejected**: Assumes bed size; better to prompt user

**Alternative 4: Grid-Based Assignment (Not Capacity)**
- Assign plants to specific grid squares
- **Rejected**: Too complex for MVP; defer to Planning Mode

**Alternative 5: Bed Templates**
- Pre-defined bed sizes (4×4, 4×8, etc.)
- **Rejected**: Limits flexibility; users have varied spaces

### 4.8 Open Questions

1. **Q**: Should fractional dimensions be allowed (e.g., 3.5 ft × 4.5 ft)?
   **A**: Yes, trust users to enter accurate measurements

2. **Q**: Should beds have shape options (circular, L-shaped)?
   **A**: No, MVP assumes rectangular; future enhancement

3. **Q**: How to handle negative dimensions or zero?
   **A**: Client-side validation prevents submission; show error message

4. **Q**: Should bed order sync across devices (future cloud storage)?
   **A**: Yes, when cloud sync is implemented, order persists

5. **Q**: What happens if user has existing plants before beds are implemented?
   **A**: Migration: prompt user to create first bed, then bulk-assign existing plants

---

## 5. Implementation

### 5.1 Implementation Phases

#### Phase 1: Data Layer (Week 1)
**Tasks**:
1. Add `bedId` and `quantity` fields to garden plant schema
2. Implement bed CRUD operations in `storage.js`:
   - `addGardenBed()`, `updateGardenBed()`, `removeGardenBed()`
3. Implement capacity calculation utilities:
   - `getBedCapacity(bedId)`
   - `getPlantsByBed(bedId)`
4. Implement reassignment operations:
   - `reassignPlant()`, `bulkReassignPlants()`
5. Write comprehensive unit tests (100% coverage target)

**Acceptance Criteria**:
- All storage functions pass unit tests
- Capacity calculations match manual calculations
- Edge cases handled (empty beds, negative dimensions, etc.)

#### Phase 2: Core Components (Week 1-2)
**Tasks**:
1. Create `BedForm.jsx` with validation
2. Create `BedCard.jsx` with capacity display
3. Create `BedSelector.jsx` for plant assignment
4. Create basic `BedManager.jsx` (list + add)
5. Write component tests (100% coverage)

**Acceptance Criteria**:
- Components render correctly in isolation
- Form validation prevents invalid inputs
- Capacity meter displays accurate values

#### Phase 3: Visual Features (Week 2)
**Tasks**:
1. Implement `BedGridPreview.jsx` mini grid
2. Add capacity meter with color coding
3. Add overcapacity warning badges
4. Add drag-and-drop reordering
5. Responsive design for mobile/tablet/desktop

**Acceptance Criteria**:
- Mini grid accurately represents plant placement
- Color coding is color-blind safe
- Drag-and-drop works with keyboard alternative

#### Phase 4: Integration (Week 2)
**Tasks**:
1. Integrate `BedSelector` into `MyGarden.jsx` add plant flow
2. Add "Manage Beds" view to `MyGarden.jsx`
3. Implement bed deletion with `BedDeleteDialog.jsx`
4. Implement plant reassignment UI
5. Update `Home.jsx` dashboard with bed stats

**Acceptance Criteria**:
- Users can create bed, add plant, view in bed
- Capacity warnings appear when expected
- Plant reassignment updates both beds

#### Phase 5: Warnings & Polish (Week 3)
**Tasks**:
1. Implement overcapacity warning modal
2. Add tooltips and help text
3. Add empty states (no beds, no plants)
4. Add loading states
5. Performance optimization

**Acceptance Criteria**:
- All warning flows tested and working
- Performance targets met (see NFR1)
- Smooth animations and transitions

#### Phase 6: Migration & Documentation (Week 3)
**Tasks**:
1. Create migration flow for existing users with plants
2. Write user documentation
3. Update README with bed management info
4. Final QA and bug fixes
5. Deploy to production

**Acceptance Criteria**:
- Existing users can seamlessly adopt bed management
- Documentation is clear and complete
- No regression in existing features

### 5.2 Dependencies

**Internal**:
- Plant library `squaresPerPlant` values (already exists)
- Storage API (already exists, needs extension)
- Tailwind config (already exists)
- Test infrastructure (already exists)

**External**:
- React 19 (already in use)
- React Router 7 (already in use)
- Tailwind CSS 4 (already in use)
- Vitest 4 (already in use)

**Blocking**:
- None - can be developed independently

**Blocked By**:
- Planning Mode will build upon this feature (but not blocking)

### 5.3 Migration Strategy

**For New Users**:
- First plant addition triggers "Create Your First Bed" flow
- Clean onboarding experience

**For Existing Users** (with plants but no beds):
1. On first visit after deployment:
   - Show modal: "Organize Your Garden with Beds!"
   - Button: "Create My First Bed"
2. After bed creation:
   - Show: "You have X plants that need a bed assignment"
   - Bulk assign all plants to the new bed
   - Allow individual reassignment afterward

**Data Migration**:
```javascript
// migration.js
function migrateExistingPlants() {
  const plants = getGardenPlants();
  const beds = getGardenBeds();

  if (plants.length > 0 && beds.length === 0) {
    // User has plants but no beds
    // Trigger onboarding flow
    showBedOnboarding();
  } else if (plants.length > 0 && beds.length > 0) {
    // Check if any plants lack bedId
    const unassignedPlants = plants.filter(p => !p.bedId);
    if (unassignedPlants.length > 0) {
      showBulkAssignmentFlow(unassignedPlants);
    }
  }
}
```

### 5.4 Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Capacity calculations wrong | High | Medium | Extensive unit tests, manual verification with SFG standards |
| Performance issues with large beds | Medium | Low | Optimize grid preview rendering, use virtual scrolling if needed |
| Users confused by capacity warnings | Medium | Medium | User testing, clear messaging, tooltips, help docs |
| Drag-and-drop not working on touch | Medium | Low | Test on multiple devices, provide alternative reorder method |
| Migration breaks existing data | High | Low | Backup data before migration, rollback plan, staged rollout |
| Overcomplicated UI | Medium | Medium | User testing, iterative design, follow KISS principle |

---

## 6. Success Criteria

### 6.1 Acceptance Criteria

**Bed Management**:
- ✅ Users can create beds with name, width, height
- ✅ Users can edit all bed properties
- ✅ Users can delete beds (with plant reassignment)
- ✅ Users can reorder beds via drag-and-drop
- ✅ Bed list displays mini grid preview, capacity, plant count

**Plant Assignment**:
- ✅ Bed selection is required when adding plant
- ✅ Users can reassign single plant to different bed
- ✅ Users can bulk reassign multiple plants
- ✅ All operations recalculate capacity correctly

**Capacity Tracking**:
- ✅ Capacity displayed as "used / total sq ft"
- ✅ Capacity meter color-coded (green/yellow/red)
- ✅ Overcapacity warning shown when adding plant
- ✅ "Add Anyway" button allows override
- ✅ Overcrowded beds display warning badge

**User Experience**:
- ✅ First-time users prompted to create bed
- ✅ Existing users can migrate plants to beds
- ✅ All flows are mobile-responsive
- ✅ All actions have loading states
- ✅ All destructive actions have confirmation

### 6.2 Key Metrics

**Usage Metrics**:
- 90%+ of users create at least one bed within first session
- 70%+ of users create multiple beds
- 80%+ of users stay within bed capacity (don't trigger warnings)
- Average beds per user: 2-3

**Performance Metrics**:
- Capacity calculation: <50ms for 100 plants
- Mini grid render: <100ms
- Bed list load: <200ms for 20 beds
- No UI blocking during operations

**Quality Metrics**:
- 100% test coverage maintained
- Zero data loss incidents during migration
- <5% of users report capacity calculation errors
- <10% of users report usability issues

### 6.3 Success Definition

This feature is successful if:
1. **Users adopt beds**: 90%+ of active users have created beds
2. **Spatial awareness**: Users understand and respect capacity limits
3. **Zero data loss**: No plants orphaned or lost during operations
4. **Performance maintained**: All metrics meet NFR targets
5. **Foundation for planning**: Bed data enables Planning Mode development

---

## 7. Test Plan

### 7.1 Unit Tests

**storage.js - Bed Operations**:
```javascript
describe('Bed CRUD Operations', () => {
  test('addGardenBed creates bed with correct schema');
  test('addGardenBed assigns sequential order');
  test('updateGardenBed modifies properties');
  test('removeGardenBed deletes bed');
  test('removeGardenBed prevents deletion if last bed with plants');
  test('getBedById returns correct bed');
  test('getBedById returns null for non-existent bed');
  test('reorderBeds updates order array');
});

describe('Capacity Calculations', () => {
  test('getBedCapacity calculates total capacity correctly');
  test('getBedCapacity calculates used capacity with 1/sq ft plants');
  test('getBedCapacity calculates used capacity with 4/sq ft plants');
  test('getBedCapacity calculates used capacity with 9/sq ft plants');
  test('getBedCapacity calculates used capacity with 16/sq ft plants');
  test('getBedCapacity handles large plants (>1 sq ft)');
  test('getBedCapacity handles mixed plant sizes');
  test('getBedCapacity identifies overcapacity correctly');
  test('getBedCapacity handles empty bed');
  test('getBedCapacity handles fractional dimensions');
});

describe('Plant Reassignment', () => {
  test('reassignPlant moves plant to new bed');
  test('reassignPlant updates both beds capacity');
  test('reassignPlant validates destination bed exists');
  test('bulkReassignPlants moves multiple plants');
  test('bulkReassignPlants is atomic (all or nothing)');
});
```

**BedForm.jsx**:
```javascript
describe('BedForm Component', () => {
  test('renders with empty fields for new bed');
  test('renders with pre-filled fields for edit');
  test('validates name is non-empty');
  test('validates width is positive number');
  test('validates height is positive number');
  test('shows error for negative dimensions');
  test('shows error for zero dimensions');
  test('allows fractional dimensions');
  test('calls onSubmit with correct data');
  test('calls onCancel when cancelled');
});
```

**BedCard.jsx**:
```javascript
describe('BedCard Component', () => {
  test('displays bed name, dimensions, capacity');
  test('renders mini grid preview');
  test('shows capacity meter with correct color');
  test('shows overcapacity warning badge');
  test('calls onEdit when edit clicked');
  test('calls onDelete when delete clicked');
  test('handles drag-and-drop events');
});
```

**BedGridPreview.jsx**:
```javascript
describe('BedGridPreview Component', () => {
  test('renders grid for 4×4 bed');
  test('renders grid for 8×4 bed');
  test('scales down grids larger than 10×10');
  test('shows plant icons in correct squares');
  test('shows empty squares');
  test('displays tooltip on hover');
  test('handles beds with no plants');
});
```

**BedSelector.jsx**:
```javascript
describe('BedSelector Component', () => {
  test('lists all available beds');
  test('shows capacity for each bed');
  test('highlights overcrowded beds');
  test('calls onSelect with correct bedId');
  test('disables selection if no beds exist');
  test('shows create bed prompt if no beds');
});
```

**BedDeleteDialog.jsx**:
```javascript
describe('BedDeleteDialog Component', () => {
  test('lists plants in bed to be deleted');
  test('shows destination bed dropdown');
  test('shows delete all plants checkbox');
  test('validates destination bed selected');
  test('calls onConfirm with correct data');
  test('calls onCancel when cancelled');
  test('warns if destination bed will be overcrowded');
});
```

### 7.2 Integration Tests

```javascript
describe('Bed Management Integration', () => {
  test('create bed → add plant → view in bed list');
  test('create bed → add plant → edit bed dimensions → recalculates capacity');
  test('add plant to overcrowded bed → shows warning → add anyway');
  test('reassign plant → both beds recalculate capacity');
  test('delete bed with plants → reassign to other bed');
  test('delete bed with plants → delete all plants option');
  test('reorder beds → persists order');
});

describe('My Garden Integration', () => {
  test('no beds → add plant → prompted to create bed');
  test('existing bed → add plant → bed selector shows');
  test('multiple beds → filter plants by bed');
});

describe('Migration Integration', () => {
  test('existing plants + no beds → onboarding flow');
  test('create first bed → bulk assign existing plants');
});
```

### 7.3 E2E Tests (Manual or Automated)

1. **Happy Path**: Create bed → Add plants → View capacity → Edit bed → Delete bed
2. **Overcapacity**: Fill bed → Add one more plant → See warning → Override → See badge
3. **Reassignment**: Create 2 beds → Add plants to bed 1 → Move half to bed 2
4. **Edge Cases**: Zero dimensions, huge dimensions, fractional dimensions, special characters in name
5. **Mobile**: Perform all operations on mobile viewport
6. **Accessibility**: Navigate with keyboard only, test with screen reader

### 7.4 Coverage Requirements

- **Minimum Coverage**: 100% (enforced by Vitest config)
- **Target Areas**:
  - All storage operations: 100%
  - All capacity calculations: 100%
  - All components: 100%
  - All user flows: 100%

---

## 8. Appendix

### 8.1 Glossary

- **Bed**: Physical garden growing space with defined dimensions
- **Capacity**: Total available square footage in a bed
- **Square Foot Gardening (SFG)**: Method of dividing beds into 1-foot grid squares
- **Squares Per Plant**: Amount of space a plant needs (from plant library)
- **Plants Per Square**: Inverse of squares per plant (how many plants fit in 1 sq ft)
- **Overcapacity**: When used capacity exceeds total capacity
- **Mini Grid Preview**: Visual representation of bed showing plant placement
- **Succession Planting**: Planting same crop at intervals (handled by separate plants)

### 8.2 Related Documents

- [Mobile Responsiveness and Testing Spec](./mobile-responsiveness-and-testing-spec.md)
- [Square Gardener MVP](../../MVP.md)
- [Plant Library Schema](../../square-gardener/src/data/plantLibrary.js)
- [Storage API](../../square-gardener/src/utils/storage.js)

### 8.3 References

- **Square Foot Gardening**: Mel Bartholomew's SFG method
- **Companion Planting**: Traditional gardening practice (see plantLibrary.js)
- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)
- **React Testing Library**: [https://testing-library.com](https://testing-library.com)
- **Vitest**: [https://vitest.dev](https://vitest.dev)

### 8.4 Revision History

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
2. Estimate implementation effort
3. Schedule sprints
4. Begin Phase 1 development
