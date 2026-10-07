import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const ViolationAreaOverTime = ({ mineData = [] }) => {
  const timeSeriesData = useMemo(() => {
    if (!mineData || mineData.length === 0) return [];
    
    // Group by date and calculate total violation area (assuming each pixel = 1 unit area)
    const groupedByDate = {};
    
    mineData.forEach(pixel => {
      if (pixel.date) {
        const date = new Date(pixel.date).toLocaleDateString('en-CA');
        if (!groupedByDate[date]) {
          groupedByDate[date] = 0;
        }
        // Count pixels in no-go violations (anomaly_label = 1 indicates disturbance)
        if (pixel.anomaly_label === 1) {
          groupedByDate[date] += 1;
        }
      }
    });
    
    // Convert to array and sort by date
    return Object.entries(groupedByDate)
      .map(([date, area]) => ({
        date,
        affected_area: area,
        displayDate: new Date(date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: '2-digit'
        })
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [mineData]);

  if (timeSeriesData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No violation data available</p>
      </div>
    );
  }

  // Calculate statistics
  const maxArea = Math.max(...timeSeriesData.map(d => d.affected_area));
  const minArea = Math.min(...timeSeriesData.map(d => d.affected_area));
  const avgArea = Math.round(timeSeriesData.reduce((sum, d) => sum + d.affected_area, 0) / timeSeriesData.length);
  const totalArea = timeSeriesData.reduce((sum, d) => sum + d.affected_area, 0);

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-red-500 pb-4">
        <h3 className="text-2xl font-black text-slate-800 mb-2">📈 Violation Area Over Time</h3>
        <p className="text-slate-600 text-sm">Temporal trend showing total area of no-go zone violations over time</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border-2 border-red-200">
          <p className="text-red-700 text-sm font-bold uppercase">Max Area</p>
          <p className="text-3xl font-black text-red-700 mt-2">{maxArea}</p>
          <p className="text-xs text-red-600 mt-1">pixels</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-200">
          <p className="text-orange-700 text-sm font-bold uppercase">Avg Area</p>
          <p className="text-3xl font-black text-orange-700 mt-2">{avgArea}</p>
          <p className="text-xs text-orange-600 mt-1">pixels</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border-2 border-amber-200">
          <p className="text-amber-700 text-sm font-bold uppercase">Min Area</p>
          <p className="text-3xl font-black text-amber-700 mt-2">{minArea}</p>
          <p className="text-xs text-amber-600 mt-1">pixels</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border-2 border-yellow-200">
          <p className="text-yellow-700 text-sm font-bold uppercase">Total Area</p>
          <p className="text-3xl font-black text-yellow-700 mt-2">{totalArea}</p>
          <p className="text-xs text-yellow-600 mt-1">pixels</p>
        </div>
      </div>

      {/* Line Chart - Violation Area Trend */}
      <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-xl border border-gray-200">
        <h4 className="font-bold text-gray-800 mb-4">Violation Area Trend Over Time</h4>
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={timeSeriesData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="displayDate"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              label={{ value: 'Affected Area (pixels)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
              formatter={(value) => `${value} pixels`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="affected_area"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ fill: '#dc2626', r: 5 }}
              activeDot={{ r: 7 }}
              name="Violation Area"
            />
          </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
        <h4 className="font-bold text-red-900 mb-3">📊 About This Trend</h4>
        <div className="space-y-2 text-sm text-red-800">
          <p><strong>What it shows:</strong> The total area (in pixels) of no-go zone violations detected on each date.</p>
          <p><strong>Trend interpretation:</strong> Rising trend indicates increasing mining activity in protected zones. Declining trend suggests remediation or reduced activity.</p>
          <p><strong>Data source:</strong> No-go violations are pixels marked as anomalous (anomaly_label = 1) that fall within protected forest or water zones.</p>
          <p><strong>Peak analysis:</strong> Peak violations occurred on {timeSeriesData[timeSeriesData.map(d => d.affected_area).indexOf(maxArea)]?.displayDate || 'N/A'} with {maxArea} pixels affected.</p>
        </div>
      </div>
    </div>
  );
};

export default ViolationAreaOverTime;
