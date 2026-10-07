import React, { useMemo, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/Charts.css';

export function SpectralSignatureRadarChart({ mineData }) {
  const [displayType, setDisplayType] = useState('both'); // both, normal, excavated

  const radarData = useMemo(() => {
    const normal = mineData.filter(p => p.anomaly_label === -1);
    const excavated = mineData.filter(p => p.anomaly_label === 1);

    const getMean = (arr, key) => {
      if (arr.length === 0) return 0;
      return arr.reduce((sum, p) => sum + p[key], 0) / arr.length;
    };

    const normalMeans = {
      B4: getMean(normal, 'B4') || -0.9,
      B8: getMean(normal, 'B8') || -0.3,
      B11: getMean(normal, 'B11') || -1.1,
      NDVI: getMean(normal, 'ndvi'),
      NBR: getMean(normal, 'nbr')
    };

    const excavatedMeans = {
      B4: getMean(excavated, 'B4') || -1.1,
      B8: getMean(excavated, 'B8') || -0.7,
      B11: getMean(excavated, 'B11') || -1.3,
      NDVI: getMean(excavated, 'ndvi'),
      NBR: getMean(excavated, 'nbr')
    };

    // Normalize values to 0-100 scale for better visualization
    const normalize = (obj) => {
      const values = Object.values(obj);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      
      const result = {};
      for (const [key, val] of Object.entries(obj)) {
        result[key] = ((val - min) / range) * 100;
      }
      return result;
    };

    const normalNorm = normalize(normalMeans);
    const excavatedNorm = normalize(excavatedMeans);

    return [
      {
        band: 'B4 (Red)',
        normal: normalNorm.B4,
        excavated: excavatedNorm.B4
      },
      {
        band: 'B8 (NIR)',
        normal: normalNorm.B8,
        excavated: excavatedNorm.B8
      },
      {
        band: 'B11 (SWIR)',
        normal: normalNorm.B11,
        excavated: excavatedNorm.B11
      },
      {
        band: 'NDVI',
        normal: normalNorm.NDVI,
        excavated: excavatedNorm.NDVI
      },
      {
        band: 'NBR',
        normal: normalNorm.NBR,
        excavated: excavatedNorm.NBR
      }
    ];
  }, [mineData]);

  return (
    <div className="chart-container">
      <h2>Spectral Signature Radar Chart</h2>
      <p className="chart-description">
        Shows the distinct spectral fingerprint of excavation pixels (red) vs normal vegetation (blue).
      </p>
      <div className="chart-controls">
        <button 
          className={displayType === 'both' ? 'active' : ''} 
          onClick={() => setDisplayType('both')}
        >
          Both
        </button>
        <button 
          className={displayType === 'normal' ? 'active' : ''} 
          onClick={() => setDisplayType('normal')}
        >
          Normal Only
        </button>
        <button 
          className={displayType === 'excavated' ? 'active' : ''} 
          onClick={() => setDisplayType('excavated')}
        >
          Excavated Only
        </button>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="band" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Normal Pixels"
            dataKey="normal"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={displayType === 'both' || displayType === 'normal' ? 0.6 : 0}
            strokeOpacity={displayType === 'both' || displayType === 'normal' ? 1 : 0}
          />
          <Radar
            name="Excavated Pixels"
            dataKey="excavated"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={displayType === 'both' || displayType === 'excavated' ? 0.6 : 0}
            strokeOpacity={displayType === 'both' || displayType === 'excavated' ? 1 : 0}
          />
          <Legend />
          <Tooltip formatter={(value) => value.toFixed(2)} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
