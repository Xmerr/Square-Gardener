# Indoor Plants & Pots Specification

**Status**: Draft
**Version**: 1.0
**Last Updated**: 2026-01-18
**Author**: Claude
**Stakeholders**: Square Gardener Users, Development Team

---

## 1. Overview

### 1.1 Problem Statement

The current Square Gardener application focuses exclusively on outdoor garden beds. Users who want to track indoor plants in pots have no way to do so within the app. This limits the application's utility for:
- Users with houseplants they want to track alongside their garden
- Users who start seeds indoors before transplanting
- Users in apartments or with limited outdoor space
- Users who grow plants year-round indoors

Without pot support, users must track indoor plants separately or not at all.

### 1.2 Goals

1. **Enable pot creation**: Allow users to create pots as a location type alongside beds
2. **Unify location management**: Treat pots and beds as variants of the same "location" concept
3. **Support indoor plant tracking**: Add common houseplants (Aloe, Calathea) to plant library
4. **Maintain simplicity**: Keep pot management lightweight for MVP
5. **Seamless integration**: Display pots in the same list as beds with visual distinction

### 1.3 Non-Goals

- Pot-specific properties (material, drainage, room location) - defer to future iterations
- Overcapacity warnings for pots - trust users for MVP
- Grid preview for pots - just show plant list
- Planning mode integration for pots - not applicable for MVP
- Indoor/outdoor plant restrictions - any plant can go in any location
- Advanced pot dimensions - use predefined sizes only

---

## 2. Background

### 2.1 Context

Indoor container gardening is increasingly popular, especially for:
- Houseplants (succulents, tropical plants, foliage)
- Herbs grown year-round on windowsills
- Starting seeds indoors before outdoor transplant
- Small-space gardening (apartments, condos)

Pots differ from beds in that they:
- Have standardized sizes rather than custom dimensions
- Typically hold fewer plants
- Don't require the same capacity tracking precision
- Are portable and can be reorganized easily

### 2.2 Current State

**Bed Management System** (per bed-management-feature-spec.md):
- Beds have name, width, height, order
- Plants are assigned to beds with bedId
- Capacity tracking with overcapacity warnings
- Mini grid preview shows plant placement

**Plant Library** (plantLibrary.js):
- 33 plants primarily focused on vegetables and herbs
- No common houseplants (succulents, tropical plants)
- All plants have squaresPerPlant values

### 2.3 Prior Art

**Bed Management Spec**: Establishes the location-based plant organization pattern that pots will extend.

**Related Features**:
- Bed Management provides the foundation for pot support
- Planning Mode will explicitly exclude pots for MVP

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR1: Location Type Flag
- **FR1.1**: Locations (beds/pots) have an `is_pot` boolean field
- **FR1.2**: When creating a location, users see a checkbox: "This is a pot"
- **FR1.3**: Checking the box changes the form to show pot-specific options (size selector instead of dimensions)

#### FR2: Pot Creation
- **FR2.1**: Users can create pots with two required fields:
  - Name (string, non-empty, custom)
  - Size (enum: Small, Medium, Large, Extra Large)
- **FR2.2**: Size determines capacity based on predefined dimensions:
  | Size | Typical Diameter | Equivalent Dimensions | Capacity |
  |------|------------------|----------------------|----------|
  | Small | 4-6 inches | 0.5 ft x 0.5 ft | 0.25 sq ft |
  | Medium | 8-10 inches | 0.75 ft x 0.75 ft | 0.56 sq ft |
  | Large | 12-14 inches | 1 ft x 1 ft | 1 sq ft |
  | Extra Large | 16+ inches | 1.5 ft x 1.5 ft | 2.25 sq ft |
- **FR2.3**: New pots are added to the end of the location list (mixed with beds)

#### FR3: Pot Display
- **FR3.1**: Pots appear in the same list as beds
- **FR3.2**: Pots have a different icon from beds to distinguish them visually
- **FR3.3**: Each pot shows:
  - Pot icon (distinct from bed icon)
  - Pot name
  - Size label (e.g., "Medium pot")
  - Plant count
  - List of plants in the pot (no grid preview)
- **FR3.4**: No capacity meter or overcapacity warnings for pots (MVP)

#### FR4: Pot Capacity (Simplified)
- **FR4.1**: Capacity is determined by size (see FR2.2)
- **FR4.2**: No overcapacity warnings - users can add any number of plants
- **FR4.3**: Multiple plants per pot are allowed
- **FR4.4**: Capacity tracking data is stored but not enforced or displayed prominently

#### FR5: Plant Assignment to Pots
- **FR5.1**: Location selector (existing BedSelector) includes pots
- **FR5.2**: Pots show with pot icon in the selector
- **FR5.3**: No capacity warnings when selecting pot (MVP)
- **FR5.4**: Any plant from the library can be added to a pot (no restrictions)

#### FR6: Pot Editing
- **FR6.1**: Users can edit pot name and size
- **FR6.2**: Changing size does not trigger warnings (no overcapacity tracking for MVP)

#### FR7: Pot Deletion
- **FR7.1**: Pot deletion follows same rules as bed deletion:
  - If pot contains no plants: immediate deletion with confirmation
  - If pot contains plants: show dialog with reassignment options
- **FR7.2**: Plants can be reassigned to other pots OR beds (any location)

#### FR8: Pot Reordering
- **FR8.1**: Pots can be reordered via drag-and-drop alongside beds
- **FR8.2**: Pots and beds share the same order sequence
- **FR8.3**: Users can interleave pots and beds in any order they prefer

#### FR9: Plant Library Additions
- **FR9.1**: Add Aloe to plant library:
  - Name: Aloe
  - squaresPerPlant: 0.25 (4 per square foot)
  - Category: Houseplant
  - No companion/enemy planting data
- **FR9.2**: Add Calathea to plant library:
  - Name: Calathea
  - squaresPerPlant: 0.25 (4 per square foot)
  - Category: Houseplant
  - No companion/enemy planting data

### 3.2 Non-Functional Requirements

#### NFR1: Performance
- **NFR1.1**: Pot operations have same performance targets as beds
- **NFR1.2**: Location list loads in <200ms for up to 20 locations (beds + pots combined)

#### NFR2: Usability
- **NFR2.1**: Pot icon clearly distinguishable from bed icon
- **NFR2.2**: Size labels include examples (e.g., "Medium (8-10 inch)")
- **NFR2.3**: Form seamlessly switches between bed/pot modes

#### NFR3: Data Integrity
- **NFR3.1**: Pots use same storage pattern as beds
- **NFR3.2**: is_pot flag is never null (defaults to false for beds)
- **NFR3.3**: Size field required only when is_pot is true

#### NFR4: Testing
- **NFR4.1**: Maintain 100% test coverage
- **NFR4.2**: All pot operations have unit tests
- **NFR4.3**: Edge cases: pot with many plants, switching between pot/bed

### 3.3 Constraints

- **C1**: Must use existing location (bed) storage infrastructure
- **C2**: Must integrate with existing BedSelector and BedManager components
- **C3**: Must follow existing Tailwind design system
- **C4**: Planning Mode must explicitly exclude pots

### 3.4 Assumptions

- **A1**: Users understand pot sizes from diameter descriptions
- **A2**: Most users will have 1-5 pots; up to 10 pots is edge case
- **A3**: Users don't need precise capacity tracking for pots
- **A4**: Users may want to mix pots and beds in their view

---

## 4. Design

### 4.1 Data Model

#### Updated Location (Bed) Schema
```javascript
{
  id: string,              // 'bed-{timestamp}-{random}'
  name: string,            // User-defined name
  is_pot: boolean,         // NEW: true for pots, false for beds
  // For beds (is_pot = false):
  width: number,           // Width in feet
  height: number,          // Height in feet
  // For pots (is_pot = true):
  size: string,            // 'small' | 'medium' | 'large' | 'extra_large'
  order: number,           // Display order (shared sequence with beds)
  createdAt: string,
  updatedAt: string
}
```

#### Size-to-Capacity Mapping
```javascript
const POT_SIZES = {
  small: {
    label: 'Small (4-6 inch)',
    capacity: 0.25,  // sq ft
    diameter: '4-6 inches'
  },
  medium: {
    label: 'Medium (8-10 inch)',
    capacity: 0.56,  // sq ft
    diameter: '8-10 inches'
  },
  large: {
    label: 'Large (12-14 inch)',
    capacity: 1.0,   // sq ft
    diameter: '12-14 inches'
  },
  extra_large: {
    label: 'Extra Large (16+ inch)',
    capacity: 2.25,  // sq ft
    diameter: '16+ inches'
  }
};
```

#### Plant Library Additions
```javascript
{
  id: 'aloe',
  name: 'Aloe',
  squaresPerPlant: 0.25,
  category: 'Houseplant',
  companions: [],
  enemies: [],
  notes: 'Succulent, low water needs'
},
{
  id: 'calathea',
  name: 'Calathea',
  squaresPerPlant: 0.25,
  category: 'Houseplant',
  companions: [],
  enemies: [],
  notes: 'Prayer plant, indirect light'
}
```

### 4.2 Component Changes

#### Modified Components

**BedForm.jsx** → (or renamed to **LocationForm.jsx**)
- Add checkbox: "This is a pot"
- When checked:
  - Hide width/height inputs
  - Show size dropdown selector
- When unchecked:
  - Show width/height inputs (existing behavior)

**BedCard.jsx** → (or renamed to **LocationCard.jsx**)
- Check `is_pot` flag
- If pot:
  - Show pot icon instead of bed icon
  - Show size label instead of dimensions
  - Show plant list instead of grid preview
  - Hide capacity meter
- If bed:
  - Existing behavior unchanged

**BedSelector.jsx** → (or renamed to **LocationSelector.jsx**)
- Include both beds and pots in list
- Show appropriate icon for each
- For pots: show size instead of capacity

**BedManager.jsx** → (or renamed to **LocationManager.jsx**)
- Unified list of beds and pots
- Single "Add Location" button with pot/bed choice in form
- Or two buttons: "Add Bed" / "Add Pot"

**BedGridPreview.jsx**
- Not rendered for pots (replaced with simple plant list)

### 4.3 UI Design

#### Location Card - Pot Variant
```
┌─────────────────────────────────────────────────────────────┐
│ ⋮⋮ 🪴 Kitchen Window Aloe                  [Edit] [Delete] │
│    Medium pot (8-10 inch)                                    │
│    🌱 2 plants: Aloe (1), Cactus (1)                        │
└─────────────────────────────────────────────────────────────┘
```

#### Location Card - Bed Variant (existing)
```
┌─────────────────────────────────────────────────────────────┐
│ ⋮⋮ 🌱 Main Vegetable Bed                   [Edit] [Delete] │
│    4 ft × 4 ft (16 sq ft)                                   │
│    ━━━━━━━━━━━━━━━━━━━━ 12.5 / 16 sq ft used               │
│    [Mini Grid Preview]                                       │
│    🌱 8 plants                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Location Form - Pot Mode
```
┌───────────────────────────────────────────┐
│ Add New Location                          │
├───────────────────────────────────────────┤
│ Name: [Kitchen Window Aloe          ]     │
│                                            │
│ [x] This is a pot                         │
│                                            │
│ Size: [▼ Medium (8-10 inch)         ]     │
│   Options:                                 │
│   - Small (4-6 inch)                       │
│   - Medium (8-10 inch)                     │
│   - Large (12-14 inch)                     │
│   - Extra Large (16+ inch)                 │
│                                            │
│                    [Cancel]  [Create Pot]  │
└───────────────────────────────────────────┘
```

#### Location Form - Bed Mode (existing)
```
┌───────────────────────────────────────────┐
│ Add New Location                          │
├───────────────────────────────────────────┤
│ Name: [Main Vegetable Bed           ]     │
│                                            │
│ [ ] This is a pot                         │
│                                            │
│ Width: [4    ] ft   Height: [4    ] ft    │
│                                            │
│                    [Cancel]  [Create Bed]  │
└───────────────────────────────────────────┘
```

#### Location Selector (updated)
```
┌───────────────────────────────────────────┐
│ Select Location                           │
├───────────────────────────────────────────┤
│ ○ 🌱 Main Vegetable Bed                   │
│   12.5 / 16 sq ft used                    │
│                                            │
│ ○ 🪴 Kitchen Window Aloe                  │
│   Medium pot · 2 plants                   │
│                                            │
│ ○ 🌱 Herb Garden                          │
│   0 / 8 sq ft used                        │
│                                            │
│ ○ 🪴 Bathroom Spider Plant                │
│   Large pot · 1 plant                     │
│                                            │
│                    [Cancel]  [Add Plant]  │
└───────────────────────────────────────────┘
```

### 4.4 Icon Design

**Bed Icon**: 🌱 or grid/box icon representing raised bed
**Pot Icon**: 🪴 or plant pot icon

Icons should be clearly distinguishable at small sizes (16x16px minimum).

### 4.5 Alternatives Considered

**Alternative 1: Pots as Separate Entity**
- Separate storage, separate list, separate components
- **Rejected**: More code, harder to maintain, users want unified view

**Alternative 2: Custom Pot Dimensions**
- Allow width/height for pots like beds
- **Rejected**: Pots are standardized; predefined sizes are simpler

**Alternative 3: Indoor-Only Plants for Pots**
- Restrict pots to "indoor" plant category
- **Rejected**: Users may put herbs, tomatoes in pots; no restrictions

**Alternative 4: Pot Overcapacity Warnings**
- Same warnings as beds
- **Rejected**: Too complex for MVP; users know pot capacity

**Alternative 5: Grid Preview for Pots**
- Mini grid like beds
- **Rejected**: Pots don't follow grid pattern; simple list better

### 4.6 Open Questions

1. **Q**: Should pot icon be consistent across light/dark themes?
   **A**: Yes, use icon that works in both themes

2. **Q**: Can users convert a bed to a pot or vice versa?
   **A**: No for MVP - delete and recreate is acceptable

3. **Q**: What happens to pot when plants are deleted?
   **A**: Pot remains (empty pot is valid state)

---

## 5. Implementation

### 5.1 Implementation Phases

#### Phase 1: Data Model Updates
**Tasks**:
1. Add `is_pot` field to location schema
2. Add `size` field for pots
3. Create POT_SIZES constant with capacity mappings
4. Update storage functions to handle pot fields
5. Add Aloe and Calathea to plant library
6. Write unit tests for new fields and plants

**Acceptance Criteria**:
- Storage correctly saves/loads pots with is_pot flag
- Capacity calculated correctly from size
- New plants appear in plant library

#### Phase 2: Form Updates
**Tasks**:
1. Add "This is a pot" checkbox to BedForm
2. Implement conditional form fields (size vs dimensions)
3. Create size dropdown with labels
4. Update form validation
5. Write component tests

**Acceptance Criteria**:
- Form toggles between pot/bed modes smoothly
- Size dropdown shows all options with examples
- Form validates correctly in both modes

#### Phase 3: Display Updates
**Tasks**:
1. Add pot icon asset
2. Update BedCard to render pot variant
3. Update BedSelector to include pots with icons
4. Update BedManager for mixed list
5. Hide grid preview for pots
6. Write component tests

**Acceptance Criteria**:
- Pots display with correct icon and size label
- Selector shows both pots and beds correctly
- Grid preview only shows for beds

#### Phase 4: Integration & Testing
**Tasks**:
1. End-to-end flow: create pot, add plant, view
2. Test pot deletion with plant reassignment
3. Test reordering pots among beds
4. Mobile responsive testing
5. Full test coverage verification

**Acceptance Criteria**:
- All user flows work correctly
- 100% test coverage maintained
- No regression in bed functionality

### 5.2 Dependencies

**Internal**:
- Bed Management feature (must be complete)
- Existing component infrastructure
- Plant library structure

**External**:
- None

**Blocking**:
- None - can start after Bed Management is complete

### 5.3 Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Component naming confusion (Bed vs Location) | Low | Medium | Consistent naming in code comments, optional rename refactor |
| Size-to-capacity mapping unclear to users | Low | Low | Clear labels with diameter examples |
| Users expect capacity warnings for pots | Low | Low | Document as MVP limitation, add in future |

---

## 6. Success Criteria

### 6.1 Acceptance Criteria

**Pot Management**:
- [ ] Users can create pots with name and size
- [ ] "This is a pot" checkbox toggles form mode
- [ ] Pots display with distinct icon
- [ ] Pots show size label (e.g., "Medium pot")
- [ ] Pots can be edited (name, size)
- [ ] Pots can be deleted with plant reassignment
- [ ] Pots can be reordered among beds

**Plant Assignment**:
- [ ] Location selector includes pots
- [ ] Any plant can be added to any pot
- [ ] Multiple plants per pot work correctly
- [ ] Plants can be reassigned between pots and beds

**Plant Library**:
- [ ] Aloe appears in plant library
- [ ] Calathea appears in plant library
- [ ] New plants have correct squaresPerPlant

**Integration**:
- [ ] Pots and beds appear in same unified list
- [ ] All existing bed functionality unchanged
- [ ] Mobile responsive design works

### 6.2 Key Metrics

**Usage Metrics**:
- 30%+ of users create at least one pot
- Average pots per user with pots: 2-3
- 50%+ of pot users add Aloe or Calathea

**Quality Metrics**:
- 100% test coverage maintained
- Zero regressions in bed functionality
- <5% of users report pot-related issues

### 6.3 Success Definition

This feature is successful if:
1. **Users adopt pots**: Meaningful percentage use pot feature
2. **Unified experience**: Pots and beds feel like part of same system
3. **Simplicity maintained**: MVP scope kept minimal
4. **No regressions**: Bed functionality unchanged

---

## 7. Test Plan

### 7.1 Unit Tests

**Storage - Pot Operations**:
```javascript
describe('Pot Storage Operations', () => {
  test('addGardenBed creates pot with is_pot=true');
  test('addGardenBed saves size for pots');
  test('addGardenBed does not save size for beds');
  test('getPotCapacity returns correct capacity for each size');
  test('updateGardenBed can change pot size');
});
```

**BedForm - Pot Mode**:
```javascript
describe('BedForm Pot Mode', () => {
  test('checkbox toggles between pot and bed modes');
  test('pot mode shows size dropdown');
  test('pot mode hides width/height inputs');
  test('bed mode shows width/height inputs');
  test('bed mode hides size dropdown');
  test('validates size is selected for pots');
  test('submits correct data for pot');
});
```

**BedCard - Pot Variant**:
```javascript
describe('BedCard Pot Variant', () => {
  test('renders pot icon for is_pot=true');
  test('renders bed icon for is_pot=false');
  test('shows size label for pots');
  test('shows dimensions for beds');
  test('hides grid preview for pots');
  test('shows plant list for pots');
});
```

**Plant Library**:
```javascript
describe('Plant Library Additions', () => {
  test('Aloe exists in plant library');
  test('Aloe has correct squaresPerPlant');
  test('Calathea exists in plant library');
  test('Calathea has correct squaresPerPlant');
});
```

### 7.2 Integration Tests

```javascript
describe('Pot Integration', () => {
  test('create pot → add plant → view in location list');
  test('create pot → edit size → data persists');
  test('delete pot with plants → reassign to bed');
  test('reorder pot among beds → order persists');
  test('add outdoor plant to pot → succeeds');
});
```

### 7.3 E2E Tests (Manual)

1. **Happy Path**: Create pot → Add Aloe → View in list → Edit pot → Delete pot
2. **Mixed Locations**: Create bed, pot, bed → Reorder → Verify order
3. **Plant Assignment**: Add tomato to pot → Reassign to bed → Reassign back to pot
4. **Mobile**: Perform all operations on mobile viewport

---

## 8. Appendix

### 8.1 Glossary

- **Pot**: Indoor container for plants with predefined size
- **Location**: Generic term for either bed or pot
- **Size**: Predefined pot capacity (small/medium/large/extra large)
- **Houseplant**: Plant typically grown indoors (Aloe, Calathea)

### 8.2 Related Documents

- [Bed Management Feature Spec](./bed-management-feature-spec.md)
- [Mobile Responsiveness and Testing Spec](./mobile-responsiveness-and-testing-spec.md)

### 8.3 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-18 | Claude | Initial draft based on user requirements |

---

**Approvals**:
- [ ] Product Owner
- [ ] Engineering Lead

**Next Steps**:
1. Review and approve specification
2. Complete Bed Management feature first
3. Begin Phase 1 implementation
