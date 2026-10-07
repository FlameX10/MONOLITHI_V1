# 🏔️ Adaptive Mining Monitoring - Frontend

Professional geospatial analytics dashboard for monitoring mining activities using satellite imagery and machine learning anomaly detection.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Components](#components)
- [API Integration](#api-integration)
- [Visualization Dashboard](#visualization-dashboard)
- [Troubleshooting](#troubleshooting)
- [Development Guide](#development-guide)

---

## ✨ Features

### 🗺️ **Interactive Map**
- Real-time mine location visualization
- Pinned mines highlight
- Mine selection with details panel
- Geospatial data integration

### 📊 **Advanced Analytics Dashboard**
- NDVI Heatmap (Vegetation Health)
- NDVI vs NBR Scatter Plots
- Spectral Signature Radar Charts
- Excavation vs Normal Distribution Analysis
- KPI Summary Cards

### 🔍 **Search & Filter**
- Search mines by name/location
- Filter by state/district
- Date range selection
- Real-time data updates

### 👨‍💼 **Admin Panel**
- Pipeline execution control
- Batch processing multiple mines
- Progress monitoring
- Error handling

### 📱 **Responsive Design**
- Professional UI/UX
- Modern color scheme (Emerald & Slate)
- Mobile-friendly layout
- Smooth animations

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Framework** | React 18.x + Vite |
| **Maps** | Leaflet + Google Maps API |
| **Charts** | Recharts, Chart.js, Plotly.js |
| **Styling** | Tailwind CSS |
| **State Management** | React Hooks (Context API) |
| **API Client** | Fetch API + Axios |
| **Build Tool** | Vite |
| **Package Manager** | npm |

---

## 📦 Prerequisites

Before installation, ensure you have:

```bash
# Node.js v16+ and npm v8+
node --version
npm --version

# Git (for cloning repository)
git --version
```

**Required Services:**
- ✅ Backend API running on `http://localhost:8000`
- ✅ PostgreSQL database connection
- ✅ Google Maps API key (optional for enhanced mapping)

---

## 🚀 Installation

### 1️⃣ Clone Repository

```bash
cd c:\Users\paras\OneDrive\Desktop\swami hackathon
cd adaptive-mining-monitoring/frontend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

**Key packages installed:**
- `react` - UI library
- `vite` - Build tool
- `recharts` - Data visualization
- `leaflet` - Map library
- `tailwindcss` - Styling
- `axios` - HTTP client

### 3️⃣ Verify Installation

```bash
npm list
```

You should see all dependencies listed without errors.

---

## ⚙️ Configuration

### 1️⃣ Environment Variables

Create/edit `.env.local` file:

```bash
# .env.local
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**Variables:**
| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API endpoint |
| `VITE_GOOGLE_MAPS_API_KEY` | Your API Key | Optional for enhanced maps |

### 2️⃣ Google Maps API Setup (Optional)

📖 **Full guide:** See [API_KEY_SETUP.md](./API_KEY_SETUP.md)

**Quick steps:**
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable "Maps JavaScript API"
4. Create API Key
5. Add to `.env.local`

### 3️⃣ Backend Connection

Ensure backend is running:

```bash
cd ../backend
myenv\Scripts\Activate.ps1
uvicorn app:app --reload
```

Backend should be running on `http://localhost:8000`

---

## ▶️ Running the App

### Development Mode

```bash
npm run dev
```

**Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

Open browser to `http://localhost:5173`

### Production Build

```bash
npm run build
```

Creates optimized build in `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

Test production build locally on `http://localhost:4173`

---

## 📁 Project Structure

```
frontend/
├── public/                      # Static assets
│   ├── favicon.ico
│   └── logo.png
│
├── src/
│   ├── components/              # React components
│   │   ├── Header.jsx           # App header & navigation
│   │   ├── MapComponent.jsx     # Main map with markers
│   │   ├── MinesList.jsx        # Mines list view
│   │   ├── MineCard.jsx         # Individual mine card
│   │   ├── MineDetails.jsx      # Mine info details
│   │   ├── MineDetailsPanel.jsx # Details sidebar
│   │   ├── SearchBar.jsx        # Search & filter
│   │   │
│   │   ├── AnalysisPage.jsx     # Analytics dashboard
│   │   ├── KPIDashboard.jsx     # KPI summary cards
│   │   ├── NDVIHeatmap.jsx      # Grid-based heatmap
│   │   ├── NDVIvsNBRScatter.jsx # Scatter plot
│   │   ├── NDVIvsNBRScatterPlot.jsx
│   │   ├── SpectralRadarChart.jsx
│   │   ├── SpectralSignatureRadarChart.jsx
│   │   ├── ExcavationVsNormalDistribution.jsx
│   │   │
│   │   └── AdminPage.jsx        # Admin panel
│   │
│   ├── data/                    # Static data
│   │   ├── mines.json           # Mine locations & metadata
│   │   └── pixel_timeseries.csv # Sample timeseries data
│   │
│   ├── styles/                  # Global styles
│   │   ├── Charts.css
│   │   └── KPICards.css
│   │
│   ├── utils/                   # Utility functions
│   │   ├── apiClient.js         # API fetch wrapper
│   │   ├── dataLoader.js        # Data loading logic
│   │   └── mapsUtils.js         # Map helper functions
│   │
│   ├── App.jsx                  # Root component
│   ├── App.css                  # Global styles
│   ├── index.css                # Reset styles
│   └── main.jsx                 # Entry point
│
├── .env.example                 # Example env variables
├── .env.local                   # Actual env variables (gitignored)
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies & scripts
├── vite.config.js               # Vite configuration
├── API_KEY_SETUP.md             # Google Maps setup guide
├── ARCHITECTURE.md              # Detailed architecture
└── README.md                    # This file
```

---

## 🧩 Components

### Core Components

#### **Header.jsx**
- Navigation bar
- App title & logo
- Quick navigation buttons

#### **MapComponent.jsx**
- Leaflet map instance
- Mine markers (pinned/regular)
- Map interactions & zoom controls
- Marker click handlers

#### **SearchBar.jsx**
- Search by mine name
- Filter by state/district
- Real-time filtering

### Analytics Components

#### **AnalysisPage.jsx**
Main analytics dashboard with tabs:
- 📊 **Dashboard** - KPI summary
- 📈 **NDVI vs NBR Scatter** - Spectral analysis
- 🎯 **Spectral Radar** - Band comparison
- 🌿 **NDVI Heatmap** - Spatial visualization
- 📦 **Distribution** - Statistical analysis

#### **KPIDashboard.jsx**
Key performance indicators:
- Total Pixels
- Excavated Pixels & %
- Average NDVI
- Max Anomaly Score

#### **NDVIHeatmap.jsx**
Grid-based heatmap:
- 20×20 cell grid
- Color-coded by NDVI value
- Cell statistics
- Hover tooltips

#### **NDVIvsNBRScatter.jsx**
Scatter plot visualization:
- X-axis: NDVI
- Y-axis: NBR
- Color: Excavation status
- Size: Anomaly score

#### **SpectralRadarChart.jsx**
Radar/Spider chart:
- Compare spectral bands (B4, B8, B11, NDVI, NBR)
- Normal vs Excavated pixels
- Visual fingerprint differences

#### **ExcavationVsNormalDistribution.jsx**
Statistical comparison:
- Box plots per band
- Distribution statistics
- Mean/Median/Q1-Q3
- Outlier analysis

### Admin Components

#### **AdminPage.jsx**
- Select mines for batch processing
- Set date ranges
- Run pipeline
- Monitor progress

---

## 🔌 API Integration

### API Client Setup

**File:** `src/utils/apiClient.js`

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = {
  // GET requests
  get: async (endpoint) => { ... },
  
  // POST requests
  post: async (endpoint, data) => { ... }
};
```

### Available Endpoints

```javascript
// Get pixel timeseries data
GET /mine/pixels?mine_id=0&start=2025-01-01&end=2025-08-01

// Get mine KPI metrics
GET /mine/kpi/0?start=2025-01-01&end=2025-08-01

// Get mine details
GET /mine/details/0

// Run admin pipeline
POST /admin/run?mine_id=0&start_date=2025-01-01&end_date=2025-08-01
```

### Data Loading

**File:** `src/utils/dataLoader.js`

```javascript
// Load all mines
const mines = await loadMines();

// Fetch analysis data
const data = await fetchAnalysisData(mineId, startDate, endDate);

// Get KPI metrics
const kpi = await fetchKPIData(mineId, dateRange);
```

---

## 📊 Visualization Dashboard

### Dashboard Tabs Overview

#### 1. **📊 Dashboard (KPI Summary)**
```
┌─────────────────────────────────────┐
│ Total Pixels      │ Excavated Pixels │
│ 12,450            │ 2,130 (17.1%)    │
├─────────────────────────────────────┤
│ Avg NDVI (Normal) │ Avg NDVI (Excav) │
│ 0.82              │ 0.23             │
└─────────────────────────────────────┘
```

#### 2. **📈 NDVI vs NBR Scatter**
- Scatter points colored by anomaly status
- Interactive tooltips
- Lasso selection (optional)

#### 3. **🎯 Spectral Radar Chart**
- 5-axis radar (B4, B8, B11, NDVI, NBR)
- Blue line = Normal pixels
- Red line = Excavated pixels

#### 4. **🌿 NDVI Heatmap**
- 20×20 grid cells
- Color scale: Red (bare) → Green (healthy)
- Cell statistics panel

#### 5. **📦 Distribution Analysis**
- Bar charts per band
- Statistical metrics
- Comparison tables

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. **"Cannot GET /mine/pixels"**
```
Problem: Backend API not running
Solution:
  cd backend
  myenv\Scripts\Activate.ps1
  uvicorn app:app --reload
```

#### 2. **"VITE_API_URL is undefined"**
```
Problem: .env.local not configured
Solution:
  # Create/edit .env.local
  VITE_API_URL=http://localhost:8000
  # Restart dev server: npm run dev
```

#### 3. **Map not loading**
```
Problem: Leaflet/Google Maps not initialized
Solution:
  # Check browser console (F12)
  # Verify API key in .env.local
  # Hard refresh: Ctrl+Shift+R
```

#### 4. **Charts showing blank**
```
Problem: Data not fetching from API
Solution:
  # Check backend running on :8000
  # Open browser DevTools → Network tab
  # Verify API responses have data
```

#### 5. **Port 5173 already in use**
```
Solution:
  npm run dev -- --port 5174
```

#### 6. **Module not found errors**
```
Solution:
  rm -r node_modules package-lock.json
  npm install
```

---

## 👨‍💻 Development Guide

### Adding a New Component

**1. Create component file:**
```jsx
// filepath: src/components/MyComponent.jsx
import React from 'react';

const MyComponent = ({ data }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Component JSX */}
    </div>
  );
};

export default MyComponent;
```

**2. Add to AnalysisPage:**
```jsx
import MyComponent from './MyComponent';

// In JSX:
<MyComponent data={analysisData} />
```

### Styling Convention

Use **Tailwind CSS classes:**

```jsx
// Colors
className="bg-emerald-600 text-slate-900"

// Spacing
className="p-6 m-4 rounded-lg"

// Shadows
className="shadow-lg shadow-emerald-500/20"

// Responsive
className="md:grid-cols-2 lg:grid-cols-3"
```

### Adding API Endpoints

**1. In `apiClient.js`:**
```javascript
const fetchNewData = async (id) => {
  return apiClient.get(`/new/endpoint/${id}`);
};
```

**2. In component:**
```jsx
const [data, setData] = useState(null);

useEffect(() => {
  fetchNewData(id).then(setData);
}, [id]);
```

### State Management

Using React hooks:

```jsx
const [state, setState] = useState(initialValue);
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

---

## 📚 Useful Resources

| Resource | Link |
|----------|------|
| React Docs | https://react.dev |
| Vite Guide | https://vitejs.dev |
| Tailwind CSS | https://tailwindcss.com |
| Recharts | https://recharts.org |
| Leaflet | https://leafletjs.com |
| Plotly.js | https://plotly.com/javascript |

---

## 🔒 Security Notes

- ✅ `.env.local` is gitignored (secrets safe)
- ✅ API key restricted to Maps JavaScript API
- ✅ CORS enabled on backend
- ✅ No sensitive data in local storage
- ❌ Never commit `.env.local` to git

---

## 📝 License

This project is part of the Swami Hackathon initiative.

---

## 👥 Support

For issues or questions:
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design
2. Review [API_KEY_SETUP.md](./API_KEY_SETUP.md) for API configuration
3. Check browser console for error messages (F12)
4. Verify backend is running and database connected

---

**Last Updated:** January 15, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
