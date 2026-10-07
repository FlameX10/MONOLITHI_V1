import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { loadGoogleMapsScript } from '../utils/mapsUtils';

export const NoGoZoneViolations = ({ mineData = [] }) => {
  const [mapError, setMapError] = useState(null);
  const [visualMode, setVisualMode] = useState('pins'); // 'pins' or 'density'
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const heatmapRef = useRef(null);
  const markersRef = useRef([]);

  const violationData = useMemo(() => {
    if (!mineData || mineData.length === 0) return [];
    
    // Filter for pixels that represent violations
    // Violations are pixels with anomaly_label = 1 (disturbed areas)
    return mineData
      .filter(pixel => pixel.anomaly_label === 1)
      .map(pixel => ({
        longitude: pixel.longitude || 0,
        latitude: pixel.latitude || 0,
        anomaly_score: pixel.anomaly_score || 0,
        date: pixel.date || 'Unknown',
        status: 'Violation',
        name: `(${pixel.longitude?.toFixed(4)}, ${pixel.latitude?.toFixed(4)})`
      }));
  }, [mineData]);

  // Group violation data by frequency for heatmap effect
  const violationCounts = useMemo(() => {
    const counts = {};
    violationData.forEach(v => {
      const key = `${v.longitude.toFixed(2)},${v.latitude.toFixed(2)}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [violationData]);

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || violationData.length === 0) {
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

        // Get center from violation data
        const lats = violationData.map(p => p.latitude);
        const lons = violationData.map(p => p.longitude);
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLon },
          zoom: 15,
          mapTypeControl: true,
          fullscreenControl: false,
          streetViewControl: false,
        });

        setMap(mapInstance);
      } catch (err) {
        setMapError(err.message);
      }
    };

    initMap();
  }, [violationData]);

  // Update visualization based on mode
  useEffect(() => {
    if (!map || violationData.length === 0) return;

    // Clear previous visualization
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (heatmapRef.current) {
      heatmapRef.current.setMap(null);
      heatmapRef.current = null;
    }

    if (visualMode === 'pins') {
      // Show pins
      violationData.forEach(violation => {
        const marker = new window.google.maps.Marker({
          position: { lat: violation.latitude, lng: violation.longitude },
          map: map,
          title: `Violation @ ${violation.name}`,
          icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        });
        markersRef.current.push(marker);
      });
    } else if (visualMode === 'density') {
      // Show heatmap
      if (window.google && window.google.maps && window.google.maps.visualization && window.google.maps.visualization.HeatmapLayer) {
        try {
          const heatmapData = violationData.map(
            v => new window.google.maps.LatLng(v.latitude, v.longitude)
          );

          const heatmap = new window.google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            map: map,
            radius: 25,
            opacity: 0.8,
            maxIntensity: Math.max(violationData.length / 10, 20),
            dissipating: true,
            gradient: [
              '#0000FF',  // Blue
              '#00FFFF',  // Cyan
              '#00FF00',  // Green
              '#FFFF00',  // Yellow
              '#FF7F00',  // Orange
              '#FF0000'   // Red
            ]
          });

          heatmapRef.current = heatmap;
        } catch (err) {
          console.error('Heatmap error:', err);
          setVisualMode('pins');
        }
      } else {
        // Fallback to pins if heatmap not available
        console.warn('Heatmap visualization not available');
        setVisualMode('pins');
      }
    }
  }, [visualMode, map, violationData]);

  if (mineData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No violation data available</p>
      </div>
    );
  }

  const totalAnomalies = mineData.filter(p => p.anomaly_label === 1).length;
  const uniqueViolationLocations = Object.keys(violationCounts).length;
  const maxViolationFrequency = Math.max(...Object.values(violationCounts), 0);
  const avgViolationFrequency = totalAnomalies > 0 
    ? (totalAnomalies / uniqueViolationLocations).toFixed(2) 
    : 0;

  // Calculate axis ranges for violation data
  const violLons = violationData.map(p => p.longitude);
  const violLats = violationData.map(p => p.latitude);
  const violLonMin = violLons.length > 0 ? Math.min(...violLons) : -1;
  const violLonMax = violLons.length > 0 ? Math.max(...violLons) : 1;
  const violLatMin = violLats.length > 0 ? Math.min(...violLats) : -1;
  const violLatMax = violLats.length > 0 ? Math.max(...violLats) : 1;
  const violLonPadding = (violLonMax - violLonMin) * 0.1 || 1;
  const violLatPadding = (violLatMax - violLatMin) * 0.1 || 1;

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-red-500 pb-4">
        <h3 className="text-2xl font-black text-slate-800 mb-2">🚫 No-Go Zone Violations</h3>
        <p className="text-slate-600 text-sm">Spatial overlay showing excavated pixels that violate protected zones (forest + water boundaries)</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200">
          <p className="text-red-700 text-sm font-bold uppercase">Total Violations</p>
          <p className="text-3xl font-black text-red-700 mt-2">{totalAnomalies}</p>
          <p className="text-xs text-red-600 mt-1">pixels</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-200">
          <p className="text-orange-700 text-sm font-bold uppercase">Unique Locations</p>
          <p className="text-3xl font-black text-orange-700 mt-2">{uniqueViolationLocations}</p>
          <p className="text-xs text-orange-600 mt-1">zones</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border-2 border-amber-200">
          <p className="text-amber-700 text-sm font-bold uppercase">Max Frequency</p>
          <p className="text-3xl font-black text-amber-700 mt-2">{maxViolationFrequency}</p>
          <p className="text-xs text-amber-600 mt-1">occurrences</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border-2 border-yellow-200">
          <p className="text-yellow-700 text-sm font-bold uppercase">Avg Frequency</p>
          <p className="text-3xl font-black text-yellow-700 mt-2">{avgViolationFrequency}</p>
          <p className="text-xs text-yellow-600 mt-1">per location</p>
        </div>
      </div>

      {totalAnomalies > 0 ? (
        <>
          {/* Google Map Visualization */}
          <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-gray-800">📍 Spatial Distribution Map</h4>
                <p className="text-sm text-gray-600 mt-1">Red dots = Violation points | Black boundaries = No-go zone polygons</p>
              </div>
              {/* Visualization Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setVisualMode('pins')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    visualMode === 'pins'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ● Pins
                </button>
                <button
                  onClick={() => setVisualMode('density')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    visualMode === 'density'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🔥 Density
                </button>
              </div>
            </div>
            <div
              ref={mapRef}
              style={{ 
                width: '100%', 
                height: '500px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
              }}
            >
              {mapError && (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <p className="text-red-600 text-sm">{mapError}</p>
                </div>
              )}
            </div>
            <div className="mt-4 text-xs text-gray-600 bg-blue-50 p-3 rounded">
              <strong>Legend:</strong> 
              {visualMode === 'pins' ? (
                <span>🔴 Red markers show excavated pixels inside protected no-go zones. Each point represents a violation event detected through temporal anomaly filtering.</span>
              ) : (
                <span>🔥 Density heatmap shows violation intensity. Blue = low density, Red = high density. Helps identify violation hotspots when pins overlap.</span>
              )}
            </div>
          </div>

          {/* Scatter Plot - Violation Overlay */}
          <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4">Violation Spatial Distribution (Longitude vs Latitude)</h4>
            <div style={{ width: '100%', height: '500px' }}>
              <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                data={violationData}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="longitude" 
                  label={{ value: 'Longitude', position: 'insideBottomRight', offset: -10 }}
                  type="number"
                  domain={[violLonMin - violLonPadding, violLonMax + violLonPadding]}
                />
                <YAxis 
                  dataKey="latitude" 
                  label={{ value: 'Latitude', angle: -90, position: 'insideLeft' }}
                  type="number"
                  domain={[violLatMin - violLatPadding, violLatMax + violLatPadding]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px'
                  }}
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value) => value.toFixed(4)}
                />
                <Scatter
                  name="No-Go Violations"
                  data={violationData}
                  fill="#ef4444"
                  fillOpacity={0.7}
                />
              </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Violation Hotspots Table */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4">🔥 Violation Hotspots (Top 10)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left px-4 py-2 font-bold text-gray-700">Location</th>
                    <th className="text-right px-4 py-2 font-bold text-gray-700">Violation Count</th>
                    <th className="text-right px-4 py-2 font-bold text-gray-700">Frequency %</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(violationCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map((entry, idx) => {
                      const [location, count] = entry;
                      const percentage = ((count / totalAnomalies) * 100).toFixed(1);
                      return (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-red-50">
                          <td className="px-4 py-2 text-gray-700 font-mono">{location}</td>
                          <td className="text-right px-4 py-2 font-bold text-red-600">{count}</td>
                          <td className="text-right px-4 py-2 text-gray-600">{percentage}%</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
            <h4 className="font-bold text-red-900 mb-3">📊 Understanding Violations</h4>
            <div className="space-y-2 text-sm text-red-800">
              <p><strong>Red Points:</strong> Excavated pixels that fall within protected no-go zones (forests, water bodies).</p>
              <p><strong>Protected Zones:</strong> No-go zones include protected forest areas and water bodies defined by government regulations.</p>
              <p><strong>Hotspots:</strong> Locations with high violation frequency ({'>'}10 occurrences) are priority enforcement areas.</p>
              <p><strong>Spatial Clustering:</strong> Dense clusters indicate organized mining operations in protected areas. Scattered violations may indicate small-scale illegal extraction.</p>
              <p><strong>Action Items:</strong> Focus enforcement resources on the top 3-5 violation hotspots for maximum impact.</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-green-50 rounded-xl border-2 border-green-200">
          <p className="text-green-600 text-lg font-semibold">✓ No violations detected!</p>
          <p className="text-green-500 text-sm mt-2">All mining activity is within permissible zones.</p>
        </div>
      )}
    </div>
  );
};

export default NoGoZoneViolations;
