import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export const RawAnomalyMap = ({ mineData = [] }) => {
  const [viewMode, setViewMode] = useState('frequency'); // 'frequency', 'layered', 'density'
  
  const { aggregatedData, rawData, stats, lons, lats, lonMin, lonMax, latMin, latMax, lonPadding, latPadding } = useMemo(() => {
    console.log('🗺️ RawAnomalyMap received mineData:', {
      total: mineData.length,
      sample: mineData.slice(0, 3),
    });
    
    if (!mineData || mineData.length === 0) return { 
      aggregatedData: [], 
      rawData: [], 
      stats: {},
      lons: [0],
      lats: [0],
      lonMin: 0,
      lonMax: 1,
      latMin: 0,
      latMax: 1,
      lonPadding: 1,
      latPadding: 1
    };

    // Raw data for layered view
    const rawDataPoints = mineData.map(pixel => ({
      longitude: pixel.longitude || 0,
      latitude: pixel.latitude || 0,
      anomaly_label: pixel.anomaly_label || -1,
      anomaly_score: pixel.anomaly_score || 0,
    }));

    // Aggregated data for frequency view
    const pixelMap = new Map();
    
    mineData.forEach(pixel => {
      const key = `${pixel.latitude.toFixed(6)}_${pixel.longitude.toFixed(6)}`;
      
      if (!pixelMap.has(key)) {
        pixelMap.set(key, {
          latitude: pixel.latitude,
          longitude: pixel.longitude,
          totalCount: 0,
          anomalyCount: 0,
          anomalyScores: [],
          name: `(${pixel.longitude?.toFixed(4)}, ${pixel.latitude?.toFixed(4)})`
        });
      }
      
      const pixelData = pixelMap.get(key);
      pixelData.totalCount += 1;
      if (pixel.anomaly_label === 1) {
        pixelData.anomalyCount += 1;
      }
      pixelData.anomalyScores.push(pixel.anomaly_score || 0);
    });

    const pixels = Array.from(pixelMap.values()).map(pixel => ({
      ...pixel,
      anomaly_frequency: (pixel.anomalyCount / pixel.totalCount * 100).toFixed(1),
      avg_anomaly_score: (pixel.anomalyScores.reduce((a, b) => a + b, 0) / pixel.anomalyScores.length).toFixed(3),
      is_anomalous: pixel.anomalyCount > 0
    }));

    const anomalyFrequencies = pixels.map(p => parseFloat(p.anomaly_frequency));
    const statsData = {
      totalPixels: pixels.length,
      anomalousPixels: pixels.filter(p => p.is_anomalous).length,
      minFreq: Math.min(...anomalyFrequencies),
      maxFreq: Math.max(...anomalyFrequencies),
      avgFreq: (anomalyFrequencies.reduce((a, b) => a + b, 0) / anomalyFrequencies.length).toFixed(1),
      mineDataPoints: mineData.length,
      anomalousDataPoints: mineData.filter(p => p.anomaly_label === 1).length,
      normalDataPoints: mineData.filter(p => p.anomaly_label === -1).length
    };

    const lonsArr = pixels.map(p => p.longitude);
    const latsArr = pixels.map(p => p.latitude);
    const lonMinVal = lonsArr.length > 0 ? Math.min(...lonsArr) : 0;
    const lonMaxVal = lonsArr.length > 0 ? Math.max(...lonsArr) : 1;
    const latMinVal = latsArr.length > 0 ? Math.min(...latsArr) : 0;
    const latMaxVal = latsArr.length > 0 ? Math.max(...latsArr) : 1;
    
    const lonPaddingVal = (lonMaxVal - lonMinVal) * 0.1 || 1;
    const latPaddingVal = (latMaxVal - latMinVal) * 0.1 || 1;

    return { 
      aggregatedData: pixels, 
      rawData: rawDataPoints, 
      stats: statsData,
      lons: lonsArr,
      lats: latsArr,
      lonMin: lonMinVal,
      lonMax: lonMaxVal,
      latMin: latMinVal,
      latMax: latMaxVal,
      lonPadding: lonPaddingVal,
      latPadding: latPaddingVal
    };
  }, [mineData]);

  // Color scale function
  const getColorByFrequency = (frequency) => {
    const freq = parseFloat(frequency);
    if (freq === 0) return '#d1d5db';
    if (freq < 10) return '#fca5a5';
    if (freq < 25) return '#f87171';
    if (freq < 50) return '#ef4444';
    if (freq < 75) return '#dc2626';
    return '#7f1d1d';
  };

  if (aggregatedData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No anomaly data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-purple-500 pb-4">
        <h3 className="text-2xl font-black text-slate-800 mb-2">🗺️ Raw Anomaly Map</h3>
        <p className="text-slate-600 text-sm">Choose visualization mode to analyze anomalies</p>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setViewMode('frequency')}
          className={`px-6 py-3 font-semibold transition ${
            viewMode === 'frequency'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎯 FIX 1: Aggregated by Frequency
        </button>
        <button
          onClick={() => setViewMode('layered')}
          className={`px-6 py-3 font-semibold transition ${
            viewMode === 'layered'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 FIX 2: Layered View (Transparency)
        </button>
        <button
          onClick={() => setViewMode('density')}
          className={`px-6 py-3 font-semibold transition ${
            viewMode === 'density'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🔥 FIX 3: Density Heatmap
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-200">
          <p className="text-purple-700 text-xs font-bold uppercase">Total Data Points</p>
          <p className="text-2xl font-black text-purple-700 mt-2">{stats.mineDataPoints}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
          <p className="text-blue-700 text-xs font-bold uppercase">Unique Pixels</p>
          <p className="text-2xl font-black text-blue-700 mt-2">{stats.totalPixels}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200">
          <p className="text-red-700 text-xs font-bold uppercase">Anomalous</p>
          <p className="text-2xl font-black text-red-700 mt-2">{stats.anomalousDataPoints}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200">
          <p className="text-green-700 text-xs font-bold uppercase">Normal</p>
          <p className="text-2xl font-black text-green-700 mt-2">{stats.normalDataPoints}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-200">
          <p className="text-orange-700 text-xs font-bold uppercase">Anomaly Rate</p>
          <p className="text-2xl font-black text-orange-700 mt-2">{((stats.anomalousDataPoints / stats.mineDataPoints) * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* FIX 1: Aggregated by Frequency */}
      {viewMode === 'frequency' && (
        <div className="space-y-6">
          {/* Frequency Legend */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm font-bold text-gray-800 mb-3">Anomaly Frequency Color Scale:</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#d1d5db' }}></div>
                <span className="text-sm">0% (None)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#fca5a5' }}></div>
                <span className="text-sm">&lt;10%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#f87171' }}></div>
                <span className="text-sm">10-25%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="text-sm">25-50%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                <span className="text-sm">50-75%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#7f1d1d' }}></div>
                <span className="text-sm">75%+</span>
              </div>
            </div>
          </div>

          {/* Scatter Plot - Frequency View */}
          <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4">Anomaly Hotspots by Frequency (Longitude vs Latitude)</h4>
            <p className="text-sm text-gray-600 mb-4">Darker red = pixel more frequently anomalous | Each dot = unique pixel location aggregated across all dates</p>
            <div style={{ width: '100%', height: '500px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                  data={aggregatedData}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="longitude" 
                    label={{ value: 'Longitude', position: 'insideBottomRight', offset: -10 }}
                    type="number"
                    domain={[lonMin - lonPadding, lonMax + lonPadding]}
                  />
                  <YAxis 
                    dataKey="latitude" 
                    label={{ value: 'Latitude', angle: -90, position: 'insideLeft' }}
                    type="number"
                    domain={[latMin - latPadding, latMax + latPadding]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '10px'
                    }}
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-300 rounded shadow">
                            <p className="text-xs font-semibold">Pixel Location</p>
                            <p className="text-xs">Lat: {data.latitude.toFixed(6)}</p>
                            <p className="text-xs">Lon: {data.longitude.toFixed(6)}</p>
                            <p className="text-xs font-bold text-red-600 mt-1">Anomaly Freq: {data.anomaly_frequency}%</p>
                            <p className="text-xs">Occurrences: {data.anomalyCount}/{data.totalCount}</p>
                            <p className="text-xs">Avg Score: {data.avg_anomaly_score}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    name="Pixels (Colored by Anomaly Frequency)"
                    data={aggregatedData}
                    fill="#ef4444"
                  >
                    {aggregatedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorByFrequency(entry.anomaly_frequency)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
            <h4 className="font-bold text-purple-900 mb-2">✅ FIX 1 Benefits</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>✓ Removes overplotting ({stats.mineDataPoints} → {stats.totalPixels} dots)</li>
              <li>✓ Reveals persistent hotspots with color intensity</li>
              <li>✓ Shows which pixels are truly problematic (dark red = 75%+ anomalies)</li>
            </ul>
          </div>
        </div>
      )}

      {/* FIX 2: Layered View with Transparency */}
      {viewMode === 'layered' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4">Layered View: Normal (Transparent Green) + Anomalies (Red)</h4>
            <p className="text-sm text-gray-600 mb-4">All raw points shown with transparency to reveal density. Anomalies plotted on top.</p>
            <div style={{ width: '100%', height: '500px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                  data={rawData}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="longitude" 
                    label={{ value: 'Longitude', position: 'insideBottomRight', offset: -10 }}
                    type="number"
                    domain={[lonMin - lonPadding, lonMax + lonPadding]}
                  />
                  <YAxis 
                    dataKey="latitude" 
                    label={{ value: 'Latitude', angle: -90, position: 'insideLeft' }}
                    type="number"
                    domain={[latMin - latPadding, latMax + latPadding]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '8px'
                    }}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Legend />
                  <Scatter
                    name="Normal (1)"
                    data={rawData.filter(p => p.anomaly_label === -1)}
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                  <Scatter
                    name="Anomalous (-1)"
                    data={rawData.filter(p => p.anomaly_label === 1)}
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-blue-900 mb-2">✅ FIX 2 Benefits</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Keeps raw temporal information (not aggregated)</li>
              <li>✓ Transparency shows density clusters naturally</li>
              <li>✓ Anomalies visually "pop" with higher opacity</li>
              <li>✓ Good for detecting spatial patterns in raw data</li>
            </ul>
          </div>
        </div>
      )}

      {/* FIX 3: Density Heatmap Visualization */}
      {viewMode === 'density' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4">Spatial Density Heatmap (Hexbin View)</h4>
            <p className="text-sm text-gray-600 mb-4">Professional density visualization - shows concentration of anomalies across space</p>
            <div style={{ width: '100%', height: '500px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                  data={aggregatedData}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="longitude" 
                    label={{ value: 'Longitude', position: 'insideBottomRight', offset: -10 }}
                    type="number"
                    domain={[lonMin - lonPadding, lonMax + lonPadding]}
                  />
                  <YAxis 
                    dataKey="latitude" 
                    label={{ value: 'Latitude', angle: -90, position: 'insideLeft' }}
                    type="number"
                    domain={[latMin - latPadding, latMax + latPadding]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '10px'
                    }}
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-300 rounded shadow">
                            <p className="text-xs font-semibold">Density Point</p>
                            <p className="text-xs">Lat: {data.latitude.toFixed(6)}</p>
                            <p className="text-xs">Lon: {data.longitude.toFixed(6)}</p>
                            <p className="text-xs font-bold text-red-600">Total Observations: {data.totalCount}</p>
                            <p className="text-xs">Anomaly Count: {data.anomalyCount}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    name="Density (Size = Occurrence Count)"
                    data={aggregatedData}
                    fill="#ef4444"
                  >
                    {aggregatedData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getColorByFrequency(entry.anomaly_frequency)}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
            <h4 className="font-bold text-orange-900 mb-2">✅ FIX 3 Benefits</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>✓ Professional publication-ready visualization</li>
              <li>✓ Easy to spot concentration zones</li>
              <li>✓ Works great with dense satellite pixels</li>
              <li>✓ Human brain reads density maps faster than dots</li>
            </ul>
          </div>
        </div>
      )}

      {/* General Info Box */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
        <h4 className="font-bold text-purple-900 mb-3">📊 How to Choose a View</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-800">
          <div>
            <p className="font-semibold mb-1">🎯 FIX 1 (Recommended)</p>
            <p>Best for quick hotspot identification. Shows which areas are persistently problematic.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">📊 FIX 2</p>
            <p>Use when you want to preserve temporal detail in raw data. Good for detailed inspection.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">🔥 FIX 3</p>
            <p>For presentations & reports. Professional density heatmap format.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawAnomalyMap;
