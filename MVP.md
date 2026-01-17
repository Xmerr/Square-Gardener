# MVP Feature List

## Overview

The MVP (Minimum Viable Product) will provide core plant tracking and scheduling functionality using session-based storage. No backend database or user authentication is required for this phase.

## Data Storage

**Session Storage**: All data persists in browser session storage
- Data is retained during the session
- Cleared when browser tab/window is closed
- Future: Migrate to cloud database with user accounts

## Core Features

### 1. Plant Library
**Description**: Pre-populated database of common vegetables and herbs

**Features**:
- List of 20-30 common garden plants
- Each plant includes:
  - Name (common and scientific)
  - Watering frequency (days between watering)
  - Spacing requirements (squares per plant)
  - Days to maturity
  - Planting season (spring, summer, fall)
  - Sun requirements (full sun, partial shade, shade)
  - Companion plants (good neighbors)
  - Avoid planting with (bad neighbors)

**Examples**: Tomatoes, lettuce, carrots, basil, peppers, cucumbers, beans, etc.

### 2. My Garden
**Description**: User's personal garden tracker

**Features**:
- Add plants from the plant library to your garden
- Track planting date for each plant
- View list of all plants in garden
- Remove plants from garden
- See days until harvest (calculated from planting date + days to maturity)

### 3. Watering Schedule
**Description**: Track when plants need water

**Features**:
- Displays all plants that need watering today
- Shows upcoming watering schedule (next 7 days)
- Mark plants as watered (updates next watering date)
- Visual indicators:
  - Overdue (red) - should have been watered
  - Due today (yellow)
  - Upcoming (green)

### 4. Garden Planner (Square Foot Grid)
**Description**: Visual grid layout using square foot gardening principles

**Features**:
- Create a garden bed (e.g., 4x4 grid = 16 squares)
- Drag and drop plants onto grid squares
- Visual representation of plant spacing:
  - 1 plant per square (tomatoes, peppers)
  - 4 plants per square (lettuce, spinach)
  - 9 plants per square (beets, onions)
  - 16 plants per square (carrots, radishes)
- Show companion planting warnings
  - Green border: good companions nearby
  - Red border: incompatible plants nearby
- Calculate total plants that fit in garden

### 5. Planting Calendar
**Description**: Shows optimal planting times

**Features**:
- Display current month
- List plants that should be planted this month
- Filter by season (spring, summer, fall)
- Countdown to next planting window for each plant

## User Interface

### Navigation
- Simple top navigation bar
- Pages:
  - Home/Dashboard
  - My Garden
  - Watering Schedule
  - Garden Planner
  - Planting Calendar

### Home/Dashboard
Shows:
- Quick stats (total plants, plants due for water today)
- Today's tasks (watering needed)
- Upcoming harvests (next 30 days)

### Responsive Design
- Mobile-first design
- Works on phones, tablets, and desktop
- Touch-friendly controls for drag-and-drop on mobile

## Technical Requirements

### Frontend Stack
- React 18+
- React Router for navigation
- CSS Modules or Styled Components for styling
- Session Storage API for data persistence

### State Management
- React Context API or useState/useReducer
- No external state management library needed for MVP

### Component Structure
```
src/
├── components/
│   ├── Navigation/
│   ├── PlantCard/
│   ├── WateringList/
│   ├── GardenGrid/
│   └── Calendar/
├── pages/
│   ├── Home/
│   ├── MyGarden/
│   ├── WateringSchedule/
│   ├── GardenPlanner/
│   └── PlantingCalendar/
├── data/
│   └── plantLibrary.js
├── utils/
│   └── storage.js
└── App.js
```

## Data Models

### Plant
```javascript
{
  id: string,
  name: string,
  scientificName: string,
  wateringFrequency: number, // days
  squaresPerPlant: number, // 1, 0.25, 0.11, 0.0625
  daysToMaturity: number,
  plantingSeason: ['spring', 'summer', 'fall'],
  sunRequirement: 'full' | 'partial' | 'shade',
  companionPlants: string[], // plant IDs
  avoidPlants: string[] // plant IDs
}
```

### Garden Plant
```javascript
{
  id: string,
  plantId: string, // reference to Plant
  plantedDate: string, // ISO date
  lastWatered: string, // ISO date
  notes: string
}
```

### Garden Bed
```javascript
{
  id: string,
  name: string,
  rows: number,
  columns: number,
  squares: [
    {
      row: number,
      col: number,
      plantId: string | null
    }
  ]
}
```

## Success Metrics

MVP is considered successful when:
- [ ] User can add 5+ plants to their garden
- [ ] Watering schedule accurately tracks and updates
- [ ] Garden planner displays 4x4 grid with drag-and-drop
- [ ] Companion planting warnings display correctly
- [ ] Planting calendar shows current month's plants
- [ ] All features work on mobile and desktop
- [ ] Data persists during session (page refresh)

## Out of Scope (Future Versions)

- User authentication
- Cloud database
- Push notifications
- Weather integration
- Photo uploads
- Multi-user collaboration
- Export/import data
- Print functionality
- Advanced analytics
- Fertilizing schedules
- Pest tracking

## Timeline

This MVP should be achievable in phases:
1. Project setup + Plant library data
2. My Garden page
3. Watering schedule
4. Garden planner grid
5. Planting calendar
6. Polish and testing

Each phase can be developed, committed, and tested independently.
