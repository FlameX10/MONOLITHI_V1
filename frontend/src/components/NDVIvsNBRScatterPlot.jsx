import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Charts.css';

export function NDVIvsNBRScatterPlot({ mineData }) {
  const chartData = useMemo(() => {
    if (!mineData || !Array.isArray(mineData) || mineData.length === 0) {
      console.warn('NDVIvsNBRScatterPlot: No mineData provided', mineData);
      return [];
    }
    console.log('NDVIvsNBRScatterPlot: Processing', mineData.length, 'data points');
    const processed = mineData.map(p => {
      if (!p) return null;
      const ndvi = typeof p.ndvi === 'number' ? parseFloat(p.ndvi.toFixed(3)) : 0;
      const nbr = typeof p.nbr === 'number' ? parseFloat(p.nbr.toFixed(3)) : 0;
      const anomalyScore = typeof p.anomaly_score === 'number' ? parseFloat(p.anomaly_score.toFixed(3)) : 0;
      return {
        ndvi,
        nbr,
        anomaly: p.anomaly_label === 1 ? 'Excavated' : 'Normal',
        anomalyScore,
        color: p.anomaly_label === 1 ? '#ef4444' : '#22c55e'
      };
    }).filter(d => d !== null);
    console.log('NDVIvsNBRScatterPlot: Final chart data:', processed);
    return processed;
  }, [mineData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p><strong>NDVI:</strong> {data.ndvi}</p>
          <p><strong>NBR:</strong> {data.nbr}</p>
          <p><strong>Type:</strong> {data.anomaly}</p>
          <p><strong>Anomaly Score:</strong> {data.anomalyScore}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h2>NDVI vs NBR Scatter Plot</h2>
      <p className="chart-description">
        Shows clear separation between disturbed (red) and undisturbed (green) land based on vegetation and water indices.
      </p>
      {chartData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No data available for visualization
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart 
            margin={{ top: 20, right: 20, bottom: 20, left: 60 }}
            data={chartData}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis 
              type="number"
              dataKey="ndvi" 
              name="NDVI"
              domain={[-1, 3]}
              label={{ value: 'NDVI', position: 'insideBottomRight', offset: -10 }}
            />
            <YAxis 
              type="number"
              dataKey="nbr" 
              name="NBR"
              domain={[-1, 1]}
              label={{ value: 'NBR', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter
              name="Excavated"
              data={chartData.filter(d => d.anomaly === 'Excavated')}
              fill="#ef4444"
              shape="circle"
              isAnimationActive={false}
            />
            <Scatter
              name="Normal"
              data={chartData.filter(d => d.anomaly === 'Normal')}
              fill="#22c55e"
              shape="circle"
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
