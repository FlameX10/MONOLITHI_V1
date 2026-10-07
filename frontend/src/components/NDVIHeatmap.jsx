import React, { useMemo, useState, useEffect, useRef } from 'react';
import { loadGoogleMapsScript } from '../utils/mapsUtils';

export function NDVIHeatmap({ mineData, selectedMine }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapError, setMapError] = useState(null);
  const polygonsRef = useRef([]);
  const GRID_SIZE = 20; // 20x20 grid

  // Initialize Google Map
  useEffect(() => {
    if (!selectedMine || !mineData || mineData.length === 0 || !mapRef.current) {
      return;
    }

    const initMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setMapError('Google Maps API key not configured');
          return;
        }

        await loadGoogleMapsScript(apiKey);

        // Get center from mineData
        const lats = mineData.map(p => p.latitude);
        const lons = mineData.map(p => p.longitude);
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLon },
          zoom: 14,
          mapTypeControl: true,
          fullscreenControl: false,
          streetViewControl: false,
        });

        // Add marker for the mine
        if (selectedMine.geometry) {
          const [lng, lat] = selectedMine.geometry.coordinates;
          new window.google.maps.Marker({
            position: { lat, lng },
            map: mapInstance,
            title: selectedMine.properties.display_name,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          });
        }

        setMap(mapInstance);
      } catch (err) {
        setMapError(err.message);
      }
    };

    initMap();
  }, [selectedMine, mineData]);

  const gridData = useMemo(() => {
    if (!mineData || mineData.length === 0) return null;

    // Get bounds
    const lats = mineData.map(p => p.latitude);
    const lons = mineData.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    // Create grid
    const grid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(null).map(() => ({ pixels: [], ndvi: null })));

    // Populate grid
    mineData.forEach(pixel => {
      const colIdx = Math.floor(((pixel.longitude - minLon) / (maxLon - minLon)) * (GRID_SIZE - 0.001));
      const rowIdx = Math.floor(((pixel.latitude - minLat) / (maxLat - minLat)) * (GRID_SIZE - 0.001));
      
      if (colIdx >= 0 && colIdx < GRID_SIZE && rowIdx >= 0 && rowIdx < GRID_SIZE) {
        grid[rowIdx][colIdx].pixels.push(pixel);
      }
    });

    // Calculate mean NDVI for each cell
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.pixels.length > 0) {
          const sum = cell.pixels.reduce((acc, p) => acc + (p.ndvi || 0), 0);
          cell.ndvi = sum / cell.pixels.length;
        }
      });
    });

    // Calculate statistics
    const filledCells = grid.flat().filter(c => c.ndvi !== null);
    const ndviValues = filledCells.map(c => c.ndvi);
    
    const stats = {
      minNdvi: Math.min(...ndviValues),
      maxNdvi: Math.max(...ndviValues),
      meanNdvi: ndviValues.reduce((a, b) => a + b, 0) / ndviValues.length,
      filledCells: filledCells.length,
      totalCells: GRID_SIZE * GRID_SIZE,
      coverage: ((filledCells.length / (GRID_SIZE * GRID_SIZE)) * 100).toFixed(1)
    };

    return { grid, bounds: { minLat, maxLat, minLon, maxLon }, stats };
  }, [mineData]);

  // Color mapping function
  const ndviToColor = (ndvi) => {
    if (ndvi === null) return '#ffffff';
    if (ndvi < 0.1) return '#8B0000'; // Dark red - Bare
    if (ndvi < 0.3) return '#FF6B35'; // Orange - Low
    if (ndvi < 0.5) return '#FFE66D'; // Yellow - Moderate
    if (ndvi < 0.7) return '#87CEEB'; // Light blue - Healthy
    return '#228B22'; // Dark green - Very healthy
  };

  const getCellLabel = (ndvi) => {
    if (ndvi === null) return 'Empty';
    if (ndvi < 0.1) return 'Bare';
    if (ndvi < 0.3) return 'Low';
    if (ndvi < 0.5) return 'Mod';
    if (ndvi < 0.7) return 'Hlthy';
    return 'Very';
  };

  // Get cell bounds for rectangle overlay
  const getCellBounds = (rowIdx, colIdx) => {
    if (!gridData || !gridData.bounds) return null;
    const { minLat, maxLat, minLon, maxLon } = gridData.bounds;
    
    // Calculate exact cell dimensions
    const latRange = maxLat - minLat;
    const lonRange = maxLon - minLon;
    
    const cellLatHeight = latRange / GRID_SIZE;
    const cellLonWidth = lonRange / GRID_SIZE;
    
    // Calculate exact bounds for this cell
    const cellMinLat = minLat + (rowIdx * cellLatHeight);
    const cellMaxLat = minLat + ((rowIdx + 1) * cellLatHeight);
    const cellMinLon = minLon + (colIdx * cellLonWidth);
    const cellMaxLon = minLon + ((colIdx + 1) * cellLonWidth);
    
    return {
      north: cellMaxLat,
      south: cellMinLat,
      east: cellMaxLon,
      west: cellMinLon
    };
  };

  // Toggle NDVI overlay on map
  const toggleOverlay = () => {
    if (overlayEnabled) {
      // Clear rectangles
      polygonsRef.current.forEach(rect => rect.setMap(null));
      polygonsRef.current = [];
      setOverlayEnabled(false);
    } else {
      // Add per-cell rectangles
      if (map && gridData) {
        const { grid } = gridData;
        grid.forEach((row, rowIdx) => {
          row.forEach((cell, colIdx) => {
            if (cell.ndvi !== null) {
              // Account for visual 90-degree rotation
              const bounds = getCellBounds(colIdx, rowIdx);
              const color = ndviToColor(cell.ndvi);
              
              // Draw rectangle for this cell with exact geographic bounds
              const rectangle = new window.google.maps.Rectangle({
                bounds: {
                  north: bounds.north,
                  south: bounds.south,
                  east: bounds.east,
                  west: bounds.west
                },
                strokeColor: color,
                strokeOpacity: 0.6,
                strokeWeight: 0.5,
                fillColor: color,
                fillOpacity: 0.45,
                map: map
              });
              
              polygonsRef.current.push(rectangle);
            }
          });
        });
      }
      setOverlayEnabled(true);
    }
  };

  // Calculate cell coordinates
  const getCellCoordinates = (rowIdx, colIdx) => {
    if (!gridData || !gridData.bounds) return null;
    const { minLat, maxLat, minLon, maxLon } = gridData.bounds;
    
    // Calculate center coordinates of the cell
    const cellWidth = (maxLon - minLon) / GRID_SIZE;
    const cellHeight = (maxLat - minLat) / GRID_SIZE;
    
    const centerLon = minLon + (colIdx + 0.5) * cellWidth;
    const centerLat = maxLat - (rowIdx + 0.5) * cellHeight;
    
    return {
      latitude: centerLat,
      longitude: centerLon,
      cellWidth: cellWidth.toFixed(6),
      cellHeight: cellHeight.toFixed(6)
    };
  };

  if (!gridData) {
    return <div className="text-center py-12 text-gray-500">No data available</div>;
  }

  const { grid, bounds, stats } = gridData;
  const cellSize = 30; // pixels per cell

  return (
    <div className="space-y-6">
      {/* Header with Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">🌿 Grid-Based NDVI Heatmap - Cell Analysis</h3>
          <p className="text-gray-600 text-sm">
            Small cell grid showing actual NDVI coloring where data exists. Empty cells are transparent/white.
          </p>
        </div>
        <button
          onClick={toggleOverlay}
          className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
            overlayEnabled
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
              : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
          }`}
        >
          [ {overlayEnabled ? 'Hide' : 'Overlay'} NDVI ]
        </button>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#8B0000' }}></div>
            <span className="text-sm font-medium">&lt;0.1 (Bare)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#FF6B35' }}></div>
            <span className="text-sm font-medium">0.1-0.3 (Low)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#FFE66D' }}></div>
            <span className="text-sm font-medium">0.3-0.5 (Mod)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#87CEEB' }}></div>
            <span className="text-sm font-medium">0.5-0.7 (Healthy)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: '#228B22' }}></div>
            <span className="text-sm font-medium">&gt;0.7 (Very)</span>
          </div>
        </div>
      </div>

      {/* Grid Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-blue-700 text-sm font-medium">
          📍 Grid Resolution: {GRID_SIZE}×{GRID_SIZE} cells | Center: Lat {bounds.minLat.toFixed(4)}, Lon {bounds.minLon.toFixed(4)}
        </p>
      </div>

      {/* Grid Container */}
      <div className="flex gap-8">
        {/* Left: Grid */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6 overflow-x-auto flex items-center justify-center relative">
          {/* Tooltip on Hover */}
          {hoveredCell && (
            <div
              style={{
                position: 'fixed',
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: 'translate(-50%, -100%)',
                zIndex: 50,
                pointerEvents: 'none',
                marginTop: '-10px'
              }}
            >
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-2 border-yellow-400 rounded-lg shadow-xl p-4 w-72">
                {/* Arrow pointing down */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '8px solid #FBBF24'
                  }}
                />
                
                <div className="text-xs font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  📍 Pixel Information
                </div>
                
                <div className="space-y-2">
                  {/* Coordinates */}
                  {hoveredCell.coords && (
                    <>
                      <div className="bg-white rounded p-2 border-l-4 border-blue-500">
                        <p className="text-gray-600 text-xs font-semibold">Latitude</p>
                        <p className="text-gray-900 font-mono font-bold text-sm">{hoveredCell.coords.latitude.toFixed(6)}°</p>
                      </div>
                      <div className="bg-white rounded p-2 border-l-4 border-green-500">
                        <p className="text-gray-600 text-xs font-semibold">Longitude</p>
                        <p className="text-gray-900 font-mono font-bold text-sm">{hoveredCell.coords.longitude.toFixed(6)}°</p>
                      </div>
                    </>
                  )}
                  
                  {/* NDVI & Cell Info */}
                  <div className="bg-white rounded p-2 border-l-4 border-orange-500">
                    <p className="text-gray-600 text-xs font-semibold">NDVI Value</p>
                    <p className="text-gray-900 font-bold text-sm">{hoveredCell.ndvi?.toFixed(3)} ({getCellLabel(hoveredCell.ndvi)})</p>
                  </div>
                  
                  <div className="bg-white rounded p-2 border-l-4 border-purple-500">
                    <p className="text-gray-600 text-xs font-semibold">Cell Position</p>
                    <p className="text-gray-900 font-mono font-bold text-sm">Row {hoveredCell.row} × Col {hoveredCell.col}</p>
                  </div>
                  
                  <div className="bg-white rounded p-2 border-l-4 border-red-500">
                    <p className="text-gray-600 text-xs font-semibold">Pixels in Cell</p>
                    <p className="text-gray-900 font-bold text-sm">{hoveredCell.pixels?.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div style={{ display: 'inline-block', transform: 'rotate(90deg)' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
              gap: '1px',
              backgroundColor: '#e5e7eb',
              padding: '4px',
              borderRadius: '4px'
            }}>
              {grid.map((row, rowIdx) =>
                row.map((cell, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: ndviToColor(cell.ndvi),
                      border: hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx ? '3px solid #FFD700' : '1px solid #ddd',
                      cursor: cell.ndvi !== null ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      color: cell.ndvi !== null && (cell.ndvi < 0.3 || cell.ndvi > 0.7) ? '#fff' : '#333',
                      userSelect: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx ? '0 0 8px rgba(255, 215, 0, 0.8)' : 'none',
                      transform: hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onMouseEnter={() => {
                      if (cell.ndvi !== null) {
                        const coords = getCellCoordinates(rowIdx, colIdx);
                        setHoveredCell({ row: rowIdx, col: colIdx, ...cell, coords });
                      }
                    }}
                    onMouseMove={(e) => {
                      if (cell.ndvi !== null) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipPos({
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredCell(null)}
                    title={cell.ndvi ? `NDVI: ${cell.ndvi.toFixed(3)}, Pixels: ${cell.pixels.length}` : 'Empty'}
                  >
                    <span style={{ transform: 'rotate(-90deg)', display: 'inline-block' }}>
                      {cell.ndvi !== null && cell.ndvi.toFixed(2).substring(0, 4)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Google Map */}
        <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
          <div 
            ref={mapRef}
            style={{ width: '100%', height: '630px' }}
          >
            {mapError && (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-red-600 text-sm">{mapError}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Stats - Below */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Coverage */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">📊 Coverage</h4>
            <p className="text-2xl font-bold text-blue-600">{stats.coverage}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.filledCells} / {stats.totalCells} cells
            </p>
          </div>

          {/* Min NDVI */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">📉 Min NDVI</h4>
            <p className="text-2xl font-bold text-red-600">{stats.minNdvi.toFixed(3)}</p>
            <p className="text-xs text-gray-500 mt-1">Bare/Low vegetation</p>
          </div>

          {/* Max NDVI */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">📈 Max NDVI</h4>
            <p className="text-2xl font-bold text-green-600">{stats.maxNdvi.toFixed(3)}</p>
            <p className="text-xs text-gray-500 mt-1">Healthy vegetation</p>
          </div>

          {/* Mean NDVI */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">📊 Mean NDVI</h4>
            <p className="text-2xl font-bold text-blue-600">{stats.meanNdvi.toFixed(3)}</p>
            <p className="text-xs text-gray-500 mt-1">Average value</p>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 flex items-start gap-2">
          <span>💡</span>
          <span>Hover over cells to see NDVI values and coordinates. Dark red cells indicate mining excavation, while green cells show healthy vegetation.</span>
        </p>
      </div>
    </div>
  );
}

