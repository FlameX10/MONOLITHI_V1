# Component Architecture & Data Flow

## 📊 Component Hierarchy

```
App.jsx (Main Container)
│
├── Header.jsx
│   └── Displays: Title + Total Mine Count
│
├── Left Sidebar (w-80)
│   ├── SearchBar.jsx
│   │   ├── Search Input
│   │   └── State Filter Dropdown
│   │
│   └── MinesList.jsx
│       └── MineCard.jsx (for each mine)
│           └── State, District, Coordinates
│
├── Center (flex-1)
│   └── MapComponent.jsx
│       ├── Google Maps Instance
│       ├── Markers for each mine
│       └── Info Windows on hover
│
└── Right Sidebar (w-80)
    └── MineDetails.jsx
        ├── Selected Mine Info Grid
        ├── Coordinates Display
        └── Google Maps Link Button
```

## 🔄 Data Flow

```
LOAD PHASE
──────────
mines.json
    ↓
getMinesData() [dataLoader.js]
    ↓
App.jsx (allMines state)
    ↓
getUniqueStates() [mapsUtils.js]
    ↓
states array for filter dropdown

FILTER PHASE
────────────
User Input: Search Term + Selected State
    ↓
filterMines() [mapsUtils.js]
    ↓
filteredMines state
    ↓
MinesList component (displays filtered mines)
MapComponent component (renders markers for filtered mines)

SELECT PHASE
────────────
User clicks mine card OR marker
    ↓
handleMineSelect(mine)
    ↓
selectedMine state
    ↓
MapComponent highlights marker (red dot)
MineDetails shows full information
MapComponent auto-centers on mine
```

## 🎯 State Management

```javascript
App.jsx State Variables:
├── allMines         → All mines from JSON
├── filteredMines    → After search/filter
├── selectedMine     → Currently selected mine
├── searchTerm       → Search input value
├── selectedState    → Filter state dropdown
├── states           → Unique states (for dropdown)
└── isLoading        → Loading indicator
```

## 🔗 Component Props & Communication

```
App.jsx
  │
  ├── Header
  │   Props: totalMines (number)
  │
  ├── SearchBar
  │   Props: searchTerm, onSearchChange, selectedState, onStateChange, states
  │   Emits: Search term & state changes
  │
  ├── MinesList
  │   Props: mines, selectedMine, onMineSelect, isLoading
  │   Contains: MineCard components
  │
  │   └── MineCard
  │       Props: mine, isSelected, onSelect
  │       Emits: onSelect event
  │
  ├── MapComponent
  │   Props: mines, selectedMine, onMineSelect
  │   Handles: Marker clicks, map interactions
  │
  └── MineDetails
      Props: mine (selected mine object)
      Displays: Full mine information
```

## 🗺️ Map Marker Logic

```javascript
MapComponent:
  1. Load Google Maps API (using loadGoogleMapsScript)
  2. Calculate bounds (calculateBounds) from all mines
  3. Initialize map with calculated center & zoom
  4. For each mine:
     - Create marker at coordinates
     - Color: Yellow (default) or Red (selected)
     - Add click listener → onMineSelect
     - Add info window → hover to show
  5. When selectedMine changes:
     - Pan to selected mine
     - Change marker color to red
     - Set zoom to 10
```

## 🔍 Search & Filter Flow

```
User types in SearchBar
    ↓
searchTerm state updates
    ↓
useEffect triggers filterMines()
    ↓
filterMines checks:
  • display_name.includes(term)
  • state.includes(term)
  • district.includes(term)
  AND
  • mine.properties.state === selectedState (if selected)
    ↓
filteredMines state updates
    ↓
MinesList & MapComponent re-render with new mines
```

## 📝 Data Structure (GeoJSON)

```javascript
Mine Object:
{
  properties: {
    mine_id: number,
    state: string,
    district: string,
    subdistrict: string,
    display_name: string
  },
  geometry: {
    type: "Point",
    coordinates: [longitude, latitude]
  }
}
```

## 🎨 Styling Flow

```
Tailwind CSS (src/index.css imports tailwindcss)
    ↓
App.css (custom scrollbar + height rules)
    ↓
Component classes:
├── Header: bg-gradient-to-r, from-blue-600, to-blue-800
├── Sidebars: w-80, p-4, overflow-y-auto, bg-gray-100
├── Cards: p-4, border, rounded-lg, hover:shadow-lg
├── Buttons: bg-blue-600, hover:bg-blue-700
└── Scrollbar: Custom webkit styling (8px width, slate colors)
```

## ⚡ Performance Optimizations

1. **Marker Reuse:** Markers cleared and recreated on filter change
2. **Lazy Info Windows:** Created on demand (not all at once)
3. **Filtered Rendering:** Only render filtered mines in list
4. **Memoization Ready:** Components can be wrapped with React.memo if needed
5. **Event Delegation:** Single listeners per marker (no bubbling overhead)

## 🔑 Key Functions

### mapsUtils.js
- `loadGoogleMapsScript(apiKey)` → Dynamically loads Google Maps API
- `calculateBounds(mines)` → Returns optimal center & zoom for bounds
- `filterMines(mines, searchTerm, selectedState)` → Filters mine array
- `getUniqueStates(mines)` → Extracts unique states for dropdown

### dataLoader.js
- `getMinesData()` → Returns mines from JSON file

## 🚀 Initialization Sequence

```
1. App mounts
2. useEffect → getMinesData()
3. Set allMines & filteredMines
4. Generate states array for dropdown
5. MapComponent mounts
6. Google Maps API loads
7. Markers rendered for all mines
8. App ready for interaction
```

## 🎭 Interaction Sequences

### Search for "Balaghat"
```
User types "Balaghat"
  → searchTerm state = "Balaghat"
  → useEffect triggers
  → filterMines() called
  → filteredMines updated
  → MinesList re-renders with matching mines
  → MapComponent re-renders with matching markers
```

### Select Mine by Clicking Marker
```
User clicks marker on map
  → MapComponent detects click
  → onMineSelect(mine) called
  → selectedMine state updates
  → MapComponent re-renders:
    • Marker turns red
    • Map pans to location
    • Zoom set to 10
  → MineDetails updates with mine info
  → MineCard highlights in list
```

### Filter by State "Madhya Pradesh"
```
User selects state from dropdown
  → selectedState state = "Madhya Pradesh"
  → useEffect triggers
  → filterMines() called with new state
  → Only Madhya Pradesh mines shown
  → Map updates with new bounds
  → List updates with new mines
```

---

This architecture ensures:
✅ Clear separation of concerns
✅ Reusable components
✅ Scalable data flow
✅ Easy to test
✅ Easy to extend
