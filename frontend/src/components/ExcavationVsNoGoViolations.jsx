import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Charts.css';

export function ExcavationVsNoGoViolations({ mineData }) {
  // Process mine data to create time series
  const processedData = mineData
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .reduce((acc, curr) => {
      const dateStr = curr.date;
      const existingEntry = acc.find(entry => entry.date === dateStr);
      
      if (existingEntry) {
        // Update existing entry
        existingEntry.total_pixels = (existingEntry.total_pixels || 0) + 1;
        // anomaly_label = 1 means ANOMALY/EXCAVATION detected (unusual activity)
        // anomaly_label = -1 means NORMAL (no anomaly/undisturbed)
        if (curr.anomaly_label === 1) {
          existingEntry.anomaly_pixels = (existingEntry.anomaly_pixels || 0) + 1;
          // Track anomaly score for weighting
          existingEntry.total_anomaly_score = (existingEntry.total_anomaly_score || 0) + (curr.anomaly_score || 0);
        } else {
          existingEntry.normal_pixels = (existingEntry.normal_pixels || 0) + 1;
        }
      } else {
        // Create new entry
        const entry = {
          date: dateStr,
          total_pixels: 1,
          anomaly_pixels: curr.anomaly_label === 1 ? 1 : 0,
          normal_pixels: curr.anomaly_label === -1 ? 1 : 0,
          total_anomaly_score: curr.anomaly_label === 1 ? (curr.anomaly_score || 0) : 0,
        };
        acc.push(entry);
      }
      
      return acc;
    }, []);

  // Calculate areas:
  // - Normal area: undisturbed/healthy vegetation (no anomalies)
  // - Anomalous area: areas with detected anomalies (mining activity/disturbance)
  // Note: Anomalies can include both legal excavation in designated zones AND
  // unauthorized mining in no-go zones. Both show up as spectral anomalies.
  const pixelSize = 900; // 30m x 30m Sentinel-2 pixel = 900 sq meters
  
  const timeSeriesData = processedData.map(entry => ({
    date: entry.date,
    normal_area: entry.normal_pixels * pixelSize,
    anomaly_area: entry.anomaly_pixels * pixelSize,
    // Calculate average anomaly score for the day
    avg_anomaly_score: entry.anomaly_pixels > 0 ? (entry.total_anomaly_score / entry.anomaly_pixels).toFixed(2) : 0,
  }));

  if (timeSeriesData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No time series data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title and Description */}
      <div className="border-b-2 border-emerald-500 pb-4">
        <h2 className="text-3xl font-black text-slate-800 mb-2">📊 Land Cover Change Detection Over Time</h2>
        <p className="text-slate-600 text-sm">Comparison of undisturbed natural areas vs areas with detected mining anomalies</p>
      </div>

      {/* Chart */}
      <div className="w-full h-96 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#6b7280' }}
              label={{ value: 'Area (sq meters)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '12px',
              }}
              formatter={(value, name) => {
                const formatted = `${(value / 1000).toFixed(1)}K sq m`;
                if (name === 'normal_area') return [formatted, 'Undisturbed Area'];
                if (name === 'anomaly_area') return [formatted, 'Anomaly Area'];
                return [formatted, name];
              }}
              labelStyle={{ color: '#1f2937' }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
                fontWeight: '500',
              }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="normal_area"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              isAnimationActive={true}
              name="Undisturbed Area"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="anomaly_area"
              stroke="#ef4444"
              strokeWidth={3}
              dot={false}
              isAnimationActive={true}
              name="Anomaly Area"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-400 mt-1 shrink-0"></div>
            <div>
              <h3 className="font-bold text-green-900">Undisturbed Area</h3>
              <p className="text-sm text-green-700">Natural vegetation with normal spectral signature (healthy forest/vegetation)</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-400 mt-1 shrink-0"></div>
            <div>
              <h3 className="font-bold text-red-900">Anomaly Area (Mining Activity)</h3>
              <p className="text-sm text-red-700">Areas showing abnormal spectral signature indicating mining/excavation activity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Info */}
      <div className="bg-cyan-50 p-6 rounded-xl border-2 border-cyan-200">
        <h3 className="font-bold text-cyan-900 mb-3 text-lg">📈 Understanding the Chart</h3>
        <div className="space-y-2 text-sm text-cyan-800">
          <p><strong>Green Line (Undisturbed Area):</strong> Pixels with normal vegetation health and unaltered spectral properties. Higher values indicate more pristine natural areas.</p>
          <p><strong>Red Line (Anomaly Area):</strong> Pixels showing abnormal spectral signatures detected by the machine learning model. This indicates mining/excavation activity, which could be either authorized or unauthorized.</p>
          <p><strong>Trend Analysis:</strong> A decreasing green line and increasing red line indicates expanding mining activity. An increasing green line suggests vegetation recovery or reduced mining activity.</p>
          <p><strong>Note:</strong> Anomalies represent <span className="font-semibold">all detected mining activity</span>. Distinguishing between legal and illegal mines requires additional geospatial analysis with approved mining zone boundaries.</p>
          <p><strong>Pixel Size:</strong> Each Sentinel-2 satellite pixel represents 900 sq meters (30m × 30m).</p>
        </div>
      </div>
    </div>
  );
}
