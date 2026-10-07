import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const FinalExcavationMap = ({ mineData = [] }) => {
  const excavationData = useMemo(() => {
    if (!mineData || mineData.length === 0) return [];
    
    // Filter for confirmed excavations (anomaly_label = 1 and excavated_flag = 1)
    return mineData
      .filter(pixel => pixel.anomaly_label === 1 && pixel.excavated_flag === 1)
      .map(pixel => ({
        longitude: pixel.longitude || 0,
        latitude: pixel.latitude || 0,
        excavated_flag: pixel.excavated_flag,
        anomaly_score: pixel.anomaly_score || 0,
        date: pixel.date || 'Unknown',
        name: `(${pixel.longitude?.toFixed(4)}, ${pixel.latitude?.toFixed(4)})`
      }));
  }, [mineData]);

  if (mineData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No excavation data available</p>
      </div>
    );
  }

  const totalAnomalies = mineData.filter(p => p.anomaly_label === 1).length;
  const confirmedExcavations = excavationData.length;
  const confirmationRate = totalAnomalies > 0 ? ((confirmedExcavations / totalAnomalies) * 100).toFixed(1) : 0;

  // Calculate axis ranges for excavation data
  const excLons = excavationData.map(p => p.longitude);
  const excLats = excavationData.map(p => p.latitude);
  const excLonMin = excLons.length > 0 ? Math.min(...excLons) : -1;
  const excLonMax = excLons.length > 0 ? Math.max(...excLons) : 1;
  const excLatMin = excLats.length > 0 ? Math.min(...excLats) : -1;
  const excLatMax = excLats.length > 0 ? Math.max(...excLats) : 1;
  const excLonPadding = (excLonMax - excLonMin) * 0.1 || 1;
  const excLatPadding = (excLatMax - excLatMin) * 0.1 || 1;

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-orange-500 pb-4">
        <h3 className="text-2xl font-black text-slate-800 mb-2">🏗️ Final Excavation Map (Temporal Filtered)</h3>
        <p className="text-slate-600 text-sm">Confirmed excavation locations after applying temporal filter (≥2 consecutive time steps)</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-200">
          <p className="text-orange-700 text-sm font-bold uppercase">Total Anomalies</p>
          <p className="text-3xl font-black text-orange-700 mt-2">{totalAnomalies}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200">
          <p className="text-red-700 text-sm font-bold uppercase">Confirmed Excavations</p>
          <p className="text-3xl font-black text-red-700 mt-2">{confirmedExcavations}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border-2 border-amber-200">
          <p className="text-amber-700 text-sm font-bold uppercase">Confirmation Rate</p>
          <p className="text-3xl font-black text-amber-700 mt-2">{confirmationRate}%</p>
        </div>
      </div>

      {confirmedExcavations > 0 ? (
        <>
          {/* Scatter Plot - Confirmed Excavations */}
          <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4">Confirmed Excavation Locations (Longitude vs Latitude)</h4>
            <div style={{ width: '100%', height: '500px' }}>
              <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                data={excavationData}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="longitude" 
                  label={{ value: 'Longitude', position: 'insideBottomRight', offset: -10 }}
                  type="number"
                  domain={[excLonMin - excLonPadding, excLonMax + excLonPadding]}
                />
                <YAxis 
                  dataKey="latitude" 
                  label={{ value: 'Latitude', angle: -90, position: 'insideLeft' }}
                  type="number"
                  domain={[excLatMin - excLatPadding, excLatMax + excLatPadding]}
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
                <Scatter
                  name="Excavation Activity"
                  data={excavationData}
                  fill="#dc2626"
                  fillOpacity={0.8}
                />
              </ScatterChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
            <h4 className="font-bold text-orange-900 mb-3">📊 About This Map</h4>
            <div className="space-y-2 text-sm text-orange-800">
              <p><strong>Red Points:</strong> Confirmed excavation activity locations. These are anomalies that persisted for 2 or more consecutive time steps.</p>
              <p><strong>Temporal Filtering:</strong> By requiring anomalies to appear in ≥2 consecutive dates, we eliminate false positives (noise) and identify actual, sustained mining activity.</p>
              <p><strong>Excavation Rate:</strong> {confirmationRate}% of detected anomalies are confirmed as actual excavation activity after temporal filtering.</p>
              <p><strong>Accuracy:</strong> This map shows actual excavation events, not raw sensor noise.</p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-gray-200">
          <p className="text-gray-600 text-lg">No confirmed excavation activity detected in this time period.</p>
          <p className="text-gray-500 text-sm mt-2">Anomalies detected may not meet the temporal persistence criteria (≥2 consecutive time steps).</p>
        </div>
      )}
    </div>
  );
};

export default FinalExcavationMap;
