import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { apiClient } from '../utils/apiClient';

const SpectralRadarChart = ({ mineId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNormal, setShowNormal] = useState(true);
  const [showAnomalous, setShowAnomalous] = useState(true);

  useEffect(() => {
    const loadSpectralData = async () => {
      try {
        setLoading(true);
        const spectralData = await apiClient.getSpectralSignature(mineId);
        setData(spectralData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (mineId !== null && mineId !== undefined) {
      loadSpectralData();
    }
  }, [mineId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin mb-3 text-2xl">⏳</div>
          <p className="text-gray-600">Loading spectral data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading spectral data</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!data || (!data.normal && !data.anomalous)) {
    return (
      <div className="text-gray-500 text-center py-8">
        No spectral data available
      </div>
    );
  }

  const categories = ['B4', 'B8', 'B11', 'NDVI', 'NBR'];
  const traces = [];

  if (showNormal && data.normal) {
    traces.push({
      type: 'scatterpolar',
      r: [
        data.normal.b4 || 0,
        data.normal.b8 || 0,
        data.normal.b11 || 0,
        data.normal.ndvi || 0,
        data.normal.nbr || 0
      ],
      theta: categories,
      fill: 'toself',
      name: 'Normal Pixels',
      line: { color: '#3B82F6' },
      fillcolor: 'rgba(59, 130, 246, 0.3)',
      hovertemplate: '<b>Normal</b><br>%{theta}: %{r:.3f}<extra></extra>'
    });
  }

  if (showAnomalous && data.anomalous) {
    traces.push({
      type: 'scatterpolar',
      r: [
        data.anomalous.b4 || 0,
        data.anomalous.b8 || 0,
        data.anomalous.b11 || 0,
        data.anomalous.ndvi || 0,
        data.anomalous.nbr || 0
      ],
      theta: categories,
      fill: 'toself',
      name: 'Anomalous Pixels',
      line: { color: '#EF4444' },
      fillcolor: 'rgba(239, 68, 68, 0.3)',
      hovertemplate: '<b>Anomalous</b><br>%{theta}: %{r:.3f}<extra></extra>'
    });
  }

  const layout = {
    polar: {
      radialaxis: {
        visible: true,
        range: [
          Math.min(
            data.normal?.b4 || 0,
            data.normal?.b8 || 0,
            data.normal?.b11 || 0,
            data.anomalous?.b4 || 0,
            data.anomalous?.b8 || 0,
            data.anomalous?.b11 || 0
          ) - 0.5,
          Math.max(
            data.normal?.ndvi || 0,
            data.normal?.nbr || 0,
            data.anomalous?.ndvi || 0,
            data.anomalous?.nbr || 0
          ) + 0.5
        ]
      }
    },
    showlegend: true,
    height: 400,
    margin: { l: 50, r: 50, t: 50, b: 50 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Arial, sans-serif', size: 12, color: '#6B7280' }
  };

  return (
    <div className="space-y-4">
      {/* Toggle Controls */}
      <div className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showNormal}
            onChange={(e) => setShowNormal(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="text-sm font-medium text-gray-700">Normal Pixels</span>
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showAnomalous}
            onChange={(e) => setShowAnomalous(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="text-sm font-medium text-gray-700">Anomalous Pixels</span>
          </span>
        </label>
      </div>

      {/* Radar Chart */}
      {traces.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Plot
            data={traces}
            layout={layout}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false
            }}
            style={{ width: '100%', height: '400px' }}
          />
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Select at least one data series to display
        </div>
      )}

      {/* Legend and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-semibold text-blue-900 mb-2">📊 Normal Pixels</p>
          <div className="text-xs text-blue-800 space-y-1">
            <p>B4: {data.normal?.b4?.toFixed(3) || 'N/A'}</p>
            <p>B8: {data.normal?.b8?.toFixed(3) || 'N/A'}</p>
            <p>B11: {data.normal?.b11?.toFixed(3) || 'N/A'}</p>
            <p>NDVI: {data.normal?.ndvi?.toFixed(3) || 'N/A'}</p>
            <p>NBR: {data.normal?.nbr?.toFixed(3) || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm font-semibold text-red-900 mb-2">⚠️ Anomalous Pixels</p>
          <div className="text-xs text-red-800 space-y-1">
            <p>B4: {data.anomalous?.b4?.toFixed(3) || 'N/A'}</p>
            <p>B8: {data.anomalous?.b8?.toFixed(3) || 'N/A'}</p>
            <p>B11: {data.anomalous?.b11?.toFixed(3) || 'N/A'}</p>
            <p>NDVI: {data.anomalous?.ndvi?.toFixed(3) || 'N/A'}</p>
            <p>NBR: {data.anomalous?.nbr?.toFixed(3) || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectralRadarChart;
