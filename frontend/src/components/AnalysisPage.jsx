import React, { useState, useEffect } from 'react';
import { MineSummaryDashboard } from './MineSummaryDashboard';
import { NDVIvsNBRScatterPlot } from './NDVIvsNBRScatterPlot';
import { SpectralSignatureRadarChart } from './SpectralSignatureRadarChart';
import { NDVIHeatmap } from './NDVIHeatmap';
import { ExcavationVsNormalDistribution } from './ExcavationVsNormalDistribution';
import { ExcavationVsNoGoViolations } from './ExcavationVsNoGoViolations';
import { RawAnomalyMap } from './RawAnomalyMap';
import { FinalExcavationMap } from './FinalExcavationMap';
import { ViolationAreaOverTime } from './ViolationAreaOverTime';
import { ExcavationVsViolationsTimeSeries } from './ExcavationVsViolationsTimeSeries';
import { NoGoZoneViolations } from './NoGoZoneViolations';
// import { NoGoZoneAnalytics } from './NoGoZoneAnalytics';

const AnalysisPage = ({ mine, onBack }) => {
  const { properties, geometry } = mine;
  const [lng, lat] = geometry.coordinates;
  const [activeTab, setActiveTab] = useState('overview');
  const [mineData, setMineData] = useState([]);
  const [kpiData, setKpiData] = useState(null);
  const [mineDetails, setMineDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-08-01');
  const [dataRange, setDataRange] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Generate mock data for visualization
  const generateMockData = () => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      data.push({
        ndvi: 0.2 + Math.random() * 0.6,
        nbr: 0.1 + Math.random() * 0.7,
        anomaly_label: Math.random() > 0.7 ? 1 : -1,
        anomaly_score: Math.random() * 100,
        excavated_percentage: Math.random() * 100,
        spectral_b4: 0.1 + Math.random() * 0.4,
        spectral_b8: 0.2 + Math.random() * 0.5,
        spectral_b11: 0.15 + Math.random() * 0.35,
        total_pixels: Math.floor(Math.random() * 10000),
        excavated_pixels: Math.floor(Math.random() * 5000),
        date: new Date(2025, 0, 1 + Math.floor(Math.random() * 240)).toISOString(),
      });
    }
    return data;
  };

  // Detect actual data range from database by trying to fetch from different date ranges
  const detectDataRange = async () => {
    try {
      console.log('🔍 Detecting available data range for mine', properties.mine_id);
      
      // Try a very wide date range to see what data exists
      const response = await fetch(
        `${API_URL}/mine/pixels?mine_id=${properties.mine_id}&start=2020-01-01&end=2030-12-31`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.length > 0) {
          // Found data! Extract min/max dates
          const dates = data.map(d => new Date(d.date)).sort((a, b) => a - b);
          const minDate = dates[0].toISOString().split('T')[0];
          const maxDate = dates[dates.length - 1].toISOString().split('T')[0];
          
          console.log(`✅ Found data range: ${minDate} to ${maxDate}`);
          setDataRange({ start: minDate, end: maxDate });
          return { start: minDate, end: maxDate };
        }
      }
      
      console.log('⚠️  No data found in database yet. Run pipeline first.');
      return null;
    } catch (err) {
      console.error('Error detecting data range:', err);
      return null;
    }
  };

  const fetchData = async (start, end) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch pixel data
      const pixelResponse = await fetch(
        `${API_URL}/mine/pixels?mine_id=${properties.mine_id}&start=${start}&end=${end}`
      );
      console.log(`📡 Fetching pixels: /mine/pixels?mine_id=${properties.mine_id}&start=${start}&end=${end}`);
      console.log('Response status:', pixelResponse.status);
      
      if (pixelResponse.ok) {
        const pixelData = await pixelResponse.json();
        console.log(`✅ Pixel data received: ${pixelData.length || 0} records`);
        console.log('First 3 records:', pixelData.slice?.(0, 3) || pixelData);
        setMineData(pixelData);
      } else {
        console.warn('❌ Backend /mine/pixels endpoint failed with status:', pixelResponse.status);
        const mockData = generateMockData();
        console.log('Generated mock data:', mockData.length, 'records');
        setMineData(mockData);
      }

      // Fetch KPI data
      try {
        const kpiResponse = await fetch(
          `${API_URL}/mine/kpi/${properties.mine_id}?start=${start}&end=${end}`
        );
        if (kpiResponse.ok) {
          const kpi = await kpiResponse.json();
          setKpiData(kpi);
        } else {
          console.warn('Could not fetch KPI (status: ' + kpiResponse.status + ')');
        }
      } catch (err) {
        console.warn('Could not fetch KPI:', err.message);
      }

      // Mine details already available from props, no need to fetch
      // The mines.json data has all the details needed
      setMineDetails({
        type: "Feature",
        properties: properties,
        geometry: geometry
      });
    } catch (err) {
      console.warn('Using mock data due to API error:', err.message);
      setMineData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // First detect the actual data range
    const init = async () => {
      const range = await detectDataRange();
      if (range) {
        // Data exists, use the detected range
        setStartDate(range.start);
        setEndDate(range.end);
        await fetchData(range.start, range.end);
      } else {
        // No data yet
        setMineData([]);
        setLoading(false);
      }
    };
    
    init();
  }, []);

  const handleApplyDateRange = () => {
    fetchData(startDate, endDate);
  };

  return (
    <div className="min-h-screen w-screen bg-[#F7F6F4] flex flex-col">
      {/* Header */}
      <div className="elegant-card bg-white text-[#1F2328] shadow-sm border-b border-[#E4E2DE] m-2 rounded-lg mt-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                console.log("Back button clicked");
                onBack();
              }}
              type="button"
              className="bg-[#3A5F7D] hover:bg-[#2F4A65] text-white px-3 py-2 rounded transition font-medium text-sm flex items-center gap-2 border border-[#3A5F7D]"
            >
              ← Back to Map
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#1F2328]">{properties.display_name}</h1>
              <p className="text-[#6B6F76] text-sm font-normal">Mine ID: {properties.mine_id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Horizontal Mine Details Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-[#E4E2DE]">
            <h2 className="text-base font-semibold text-[#1F2328] mb-4">Mine Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              {/* Mine ID */}
              <div className="bg-[#F7F6F4] p-3 rounded border border-[#E4E2DE]">
                <p className="text-xs text-[#6B6F76] uppercase tracking-wide font-medium">Mine ID</p>
                <p className="text-lg font-semibold text-[#3A5F7D] mt-1">{properties.mine_id}</p>
              </div>

              {/* State */}
              <div className="bg-[#F7F6F4] p-3 rounded border border-[#E4E2DE]">
                <p className="text-xs text-[#6B6F76] uppercase tracking-wide font-medium">State</p>
                <p className="text-sm font-semibold text-[#1F2328] mt-1">{properties.state}</p>
              </div>

              {/* District */}
              <div className="bg-[#F7F6F4] p-3 rounded border border-[#E4E2DE]">
                <p className="text-xs text-[#6B6F76] uppercase tracking-wide font-medium">District</p>
                <p className="text-sm font-semibold text-[#1F2328] mt-1">{properties.district}</p>
              </div>

              {/* Sub-district */}
              <div className="bg-[#F7F6F4] p-3 rounded border border-[#E4E2DE]">
                <p className="text-xs text-[#6B6F76] uppercase tracking-wide font-medium">Sub-District</p>
                <p className="text-sm font-semibold text-[#1F2328] mt-1">{properties.subdistrict}</p>
              </div>

              {/* Latitude */}
              <div className="bg-[#F7F6F4] p-3 rounded border border-[#E4E2DE]">
                <p className="text-xs text-[#6B6F76] uppercase tracking-wide font-medium">Latitude</p>
                <p className="text-sm font-mono text-[#1F2328] mt-1">{lat.toFixed(4)}</p>
              </div>

              {/* Longitude */}
              <div className="bg-[#F7F6F4] p-3 rounded border border-[#E4E2DE]">
                <p className="text-xs text-[#6B6F76] uppercase tracking-wide font-medium">Longitude</p>
                <p className="text-sm font-mono text-[#1F2328] mt-1">{lng.toFixed(4)}</p>
              </div>
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Date Range */}
              <div>
                <label className="block text-xs text-[#6B6F76] font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E4E2DE] rounded text-sm focus:outline-none focus:border-[#3A5F7D] focus:ring-1 focus:ring-[#3A5F7D] bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B6F76] font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E4E2DE] rounded text-sm focus:outline-none focus:border-[#3A5F7D] focus:ring-1 focus:ring-[#3A5F7D] bg-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApplyDateRange}
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-[#3A5F7D] hover:bg-[#2F4A65] text-white rounded font-medium text-sm transition border border-[#3A5F7D] disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Apply Filter'}
                </button>
                <button
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/@${lat},${lng},15z`,
                      '_blank'
                    );
                  }}
                  className="flex-1 px-3 py-2 bg-white hover:bg-[#F7F6F4] text-[#3A5F7D] rounded font-medium text-sm transition border border-[#E4E2DE]"
                >
                  🗺️ Maps
                </button>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div>
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 bg-white rounded-lg shadow-sm p-3 sticky top-0 z-10 flex-wrap border border-[#E4E2DE]">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded font-medium transition text-sm ${
                  activeTab === 'overview'
                    ? 'bg-[#3A5F7D] text-white border border-[#3A5F7D]'
                    : 'bg-[#F7F6F4] text-[#6B6F76] hover:bg-white border border-[#E4E2DE]'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('scatter')}
                className={`px-4 py-2 rounded font-medium transition text-sm ${
                  activeTab === 'scatter'
                    ? 'bg-[#3A5F7D] text-white border border-[#3A5F7D]'
                    : 'bg-[#F7F6F4] text-[#6B6F76] hover:bg-white border border-[#E4E2DE]'
                }`}
              >
                NDVI vs NBR
              </button>
              <button
                onClick={() => setActiveTab('radar')}
                className={`px-4 py-2 rounded font-medium transition text-sm ${
                  activeTab === 'radar'
                    ? 'bg-[#3A5F7D] text-white border border-[#3A5F7D]'
                    : 'bg-[#F7F6F4] text-[#6B6F76] hover:bg-white border border-[#E4E2DE]'
                }`}
              >
                Spectral Signature
              </button>
              <button
                onClick={() => setActiveTab('heatmap')}
                className={`px-4 py-2 rounded font-medium transition text-sm ${
                  activeTab === 'heatmap'
                    ? 'bg-[#3A5F7D] text-white border border-[#3A5F7D]'
                    : 'bg-[#F7F6F4] text-[#6B6F76] hover:bg-white border border-[#E4E2DE]'
                }`}
              >
                NDVI Heatmap
              </button>
              <button
                onClick={() => setActiveTab('distribution')}
                className={`px-4 py-2 rounded font-medium transition text-sm ${
                  activeTab === 'distribution'
                    ? 'bg-[#3A5F7D] text-white border border-[#3A5F7D]'
                    : 'bg-[#F7F6F4] text-[#6B6F76] hover:bg-white border border-[#E4E2DE]'
                }`}
              >
                Distribution
              </button>
              <button
                onClick={() => setActiveTab('timeseries')}
                className={`px-4 py-2 rounded font-medium transition text-sm ${
                  activeTab === 'timeseries'
                    ? 'bg-[#3A5F7D] text-white border border-[#3A5F7D]'
                    : 'bg-[#F7F6F4] text-[#6B6F76] hover:bg-white border border-[#E4E2DE]'
                }`}
              >
                Excavation vs No-Go
              </button>
              <button
                onClick={() => setActiveTab('rawanomaly')}
                className={`px-4 py-2 rounded font-medium transition text-sm ${
                  activeTab === 'rawanomaly'
                    ? 'bg-[#3A5F7D] text-white border border-[#3A5F7D]'
                    : 'bg-[#F7F6F4] text-[#6B6F76] hover:bg-white border border-[#E4E2DE]'
                }`}
              >
                Raw Anomaly Map
              </button>
              <button
                onClick={() => setActiveTab('finalexcavation')}
                className={`px-4 py-2 rounded font-medium transition text-sm ${
                  activeTab === 'finalexcavation'
                    ? 'bg-[#3A5F7D] text-white border border-[#3A5F7D]'
                    : 'bg-[#F7F6F4] text-[#6B6F76] hover:bg-white border border-[#E4E2DE]'
                }`}
              >
                Final Excavation Map
              </button>
              <button
                onClick={() => setActiveTab('violationtime')}
                className={`px-4 py-2 rounded font-medium transition text-sm ${
                  activeTab === 'violationtime'
                    ? 'bg-[#3A5F7D] text-white border border-[#3A5F7D]'
                    : 'bg-[#F7F6F4] text-[#6B6F76] hover:bg-white border border-[#E4E2DE]'
                }`}
              >
                Violation Trend
              </button>
              <button
                onClick={() => setActiveTab('compliancetrend')}
                className={`px-4 py-2 rounded font-medium transition text-sm ${
                  activeTab === 'compliancetrend'
                    ? 'bg-[#3A5F7D] text-white border border-[#3A5F7D]'
                    : 'bg-[#F7F6F4] text-[#6B6F76] hover:bg-white border border-[#E4E2DE]'
                }`}
              >
                Compliance Trend
              </button>
              <button
                onClick={() => setActiveTab('nogozones')}
                className={`px-4 py-2 rounded font-medium transition text-sm ${
                  activeTab === 'nogozones'
                    ? 'bg-[#3A5F7D] text-white border border-[#3A5F7D]'
                    : 'bg-[#F7F6F4] text-[#6B6F76] hover:bg-white border border-[#E4E2DE]'
                }`}
              >
                No-Go Violations Map
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Dashboard Tab */}
              {activeTab === 'overview' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-slate-100">
                  <div className="border-b-2 border-emerald-500 pb-4">
                    <h2 className="text-3xl font-black text-slate-800 mb-2">📊 Mine Summary Dashboard</h2>
                    <p className="text-slate-600 text-sm">Key Performance Indicators and metrics for this mine</p>
                  </div>
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      <p className="mt-4 text-slate-600 font-medium">Loading data...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold">
                      ⚠️ Error: {error}
                    </div>
                  ) : (
                    <>
                      {/* KPI Data */}
                      {kpiData && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200 shadow-md">
                            <p className="text-orange-700 text-sm font-bold uppercase">Total Pixels</p>
                            <p className="text-4xl font-black text-orange-700 mt-2">{kpiData.total_pixels || 0}</p>
                          </div>
                          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200 shadow-md">
                            <p className="text-red-700 text-sm font-bold uppercase">Excavated Pixels</p>
                            <p className="text-4xl font-black text-red-700 mt-2">{kpiData.excavated_pixels || 0}</p>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border-2 border-emerald-200 shadow-md">
                            <p className="text-emerald-700 text-sm font-bold uppercase">Excavation %</p>
                            <p className="text-4xl font-black text-emerald-700 mt-2">
                              {kpiData.total_pixels > 0 
                                ? ((kpiData.excavated_pixels / kpiData.total_pixels) * 100).toFixed(1)
                                : 0}%
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Mine Data Dashboard */}
                      {mineData.length > 0 ? (
                        <MineSummaryDashboard mineData={mineData} />
                      ) : (
                        <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-8">
                          <div className="text-5xl mb-4">📦</div>
                          <h3 className="text-2xl font-bold text-blue-900 mb-2">No Data Available</h3>
                          <p className="text-blue-700 mb-6 text-lg">This mine hasn't been processed yet.</p>
                          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 text-left max-w-md mx-auto mb-6 rounded">
                            <p className="text-blue-800 font-semibold text-sm mb-2">ℹ️ How to view analysis:</p>
                            <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                              <li>Go to <span className="font-bold">Admin Panel</span></li>
                              <li>Select this mine (Mine {properties.mine_id})</li>
                              <li>Choose a date range</li>
                              <li>Click <span className="font-bold">"Run Pipeline"</span></li>
                              <li>⏳ Wait 2-5 minutes for processing</li>
                              <li>↻ Refresh this page to see results</li>
                            </ol>
                          </div>
                          <p className="text-gray-600 text-sm">✨ All 5 analysis graphs will appear once data is processed!</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* NDVI vs NBR Tab */}
              {activeTab === 'scatter' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-slate-100">
                  <div className="border-b-2 border-emerald-500 pb-4">
                    <h2 className="text-3xl font-black text-slate-800 mb-2">📈 Spectral Analysis</h2>
                    <p className="text-slate-600 text-sm">NDVI vs NBR Analysis showing disturbed and undisturbed land areas</p>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      <p className="mt-4 text-slate-600 font-medium">Loading data...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold">
                      ⚠️ Error: {error}
                    </div>
                  ) : mineData.length > 0 ? (
                    <>
                      {/* Scatter Plot */}
                      <NDVIvsNBRScatterPlot mineData={mineData} />

                      {/* Analysis Legend */}
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-red-400 mt-1 shrink-0"></div>
                            <div>
                              <h3 className="font-bold text-red-900">Disturbed Land</h3>
                              <p className="text-sm text-red-700">Areas showing anomalies (Mining activity, excavation, disturbance)</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-400 mt-1 shrink-0"></div>
                            <div>
                              <h3 className="font-bold text-emerald-900">Undisturbed Land</h3>
                              <p className="text-sm text-emerald-700">Areas showing normal vegetation and no mining activity</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Analysis Info */}
                      <div className="bg-cyan-50 p-6 rounded-xl border-2 border-cyan-200">
                        <h3 className="font-bold text-cyan-900 mb-3 text-lg">📈 What You're Looking At</h3>
                        <div className="space-y-2 text-sm text-cyan-800">
                          <p><strong>X-Axis (NDVI):</strong> Normalized Difference Vegetation Index - measures vegetation health. Higher values indicate more vegetation.</p>
                          <p><strong>Y-Axis (NBR):</strong> Normalized Burn Ratio - measures burn severity and changes. Used to detect mining disturbance.</p>
                          <p><strong>Point Size:</strong> Represents the confidence score of the anomaly detection. Larger points indicate higher confidence.</p>
                          <p><strong>Colors:</strong> Red points indicate disturbed areas (likely mining activity). Green points show undisturbed natural areas.</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No data available for selected date range</p>
                    </div>
                  )}
                </div>
              )}

              {/* Spectral Signature Tab */}
              {activeTab === 'radar' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-slate-100">
                  <div className="border-b-2 border-emerald-500 pb-4">
                    <h2 className="text-3xl font-black text-slate-800 mb-2">🎯 Spectral Signature Radar Chart</h2>
                    <p className="text-slate-600 text-sm">Comparison of spectral fingerprints between normal and anomalous pixels</p>
                  </div>
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      <p className="mt-4 text-slate-600 font-medium">Loading data...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold">
                      ⚠️ Error: {error}
                    </div>
                  ) : mineData.length > 0 ? (
                    <SpectralSignatureRadarChart mineData={mineData} />
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-8">
                      <div className="text-5xl mb-4">📦</div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-2">No Data Available</h3>
                      <p className="text-blue-700 mb-6 text-lg">This mine hasn't been processed yet.</p>
                      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 text-left max-w-md mx-auto mb-6 rounded">
                        <p className="text-blue-800 font-semibold text-sm mb-2">ℹ️ How to view analysis:</p>
                        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                          <li>Go to <span className="font-bold">Admin Panel</span></li>
                          <li>Select this mine (Mine {properties.mine_id})</li>
                          <li>Choose a date range</li>
                          <li>Click <span className="font-bold">"Run Pipeline"</span></li>
                          <li>Wait for processing to complete</li>
                          <li>Return to analysis to see results</li>
                        </ol>
                      </div>
                      <p className="text-gray-600 text-sm">Model will fetch satellite data and perform analysis</p>
                    </div>
                  )}
                </div>
              )}

              {/* NDVI Heatmap Tab */}
              {activeTab === 'heatmap' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-slate-100">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      <p className="mt-4 text-slate-600 font-medium">Loading data...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold">
                      ⚠️ Error: {error}
                    </div>
                  ) : mineData.length > 0 ? (
                    <NDVIHeatmap mineData={mineData} selectedMine={mine} />
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-8">
                      <div className="text-5xl mb-4">📦</div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-2">No Data Available</h3>
                      <p className="text-blue-700 mb-6 text-lg">This mine hasn't been processed yet.</p>
                      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 text-left max-w-md mx-auto mb-6 rounded">
                        <p className="text-blue-800 font-semibold text-sm mb-2">ℹ️ How to view analysis:</p>
                        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                          <li>Go to <span className="font-bold">Admin Panel</span></li>
                          <li>Select this mine (Mine {properties.mine_id})</li>
                          <li>Choose a date range</li>
                          <li>Click <span className="font-bold">"Run Pipeline"</span></li>
                          <li>Wait for processing to complete</li>
                          <li>Return to analysis to see results</li>
                        </ol>
                      </div>
                      <p className="text-gray-600 text-sm">Model will fetch satellite data and perform analysis</p>
                    </div>
                  )}
                </div>
              )}

              {/* Distribution Tab */}
              {activeTab === 'distribution' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-slate-100">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      <p className="mt-4 text-slate-600 font-medium">Loading data...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold">
                      ⚠️ Error: {error}
                    </div>
                  ) : mineData.length > 0 ? (
                    <ExcavationVsNormalDistribution mineData={mineData} />
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-8">
                      <div className="text-5xl mb-4">📦</div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-2">No Data Available</h3>
                      <p className="text-blue-700 mb-6 text-lg">This mine hasn't been processed yet.</p>
                      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 text-left max-w-md mx-auto mb-6 rounded">
                        <p className="text-blue-800 font-semibold text-sm mb-2">ℹ️ How to view analysis:</p>
                        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                          <li>Go to <span className="font-bold">Admin Panel</span></li>
                          <li>Select this mine (Mine {properties.mine_id})</li>
                          <li>Choose a date range</li>
                          <li>Click <span className="font-bold">"Run Pipeline"</span></li>
                          <li>Wait for processing to complete</li>
                          <li>Return to analysis to see results</li>
                        </ol>
                      </div>
                      <p className="text-gray-600 text-sm">Model will fetch satellite data and perform analysis</p>
                    </div>
                  )}
                </div>
              )}

              {/* Excavation vs No-Go Violations Tab */}
              {activeTab === 'timeseries' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-slate-100">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      <p className="mt-4 text-slate-600 font-medium">Loading data...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold">
                      ⚠️ Error: {error}
                    </div>
                  ) : mineData.length > 0 ? (
                    <ExcavationVsNoGoViolations mineData={mineData} />
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-8">
                      <div className="text-5xl mb-4">📦</div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-2">No Data Available</h3>
                      <p className="text-blue-700 mb-6 text-lg">This mine hasn't been processed yet.</p>
                      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 text-left max-w-md mx-auto mb-6 rounded">
                        <p className="text-blue-800 font-semibold text-sm mb-2">ℹ️ How to view analysis:</p>
                        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                          <li>Go to <span className="font-bold">Admin Panel</span></li>
                          <li>Select this mine (Mine {properties.mine_id})</li>
                          <li>Choose a date range</li>
                          <li>Click <span className="font-bold">"Run Pipeline"</span></li>
                          <li>Wait for processing to complete</li>
                          <li>Return to analysis to see results</li>
                        </ol>
                      </div>
                      <p className="text-gray-600 text-sm">Model will fetch satellite data and perform analysis</p>
                    </div>
                  )}
                </div>
              )}

              {/* Raw Anomaly Map Tab */}
              {activeTab === 'rawanomaly' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-slate-100">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      <p className="mt-4 text-slate-600 font-medium">Loading data...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold">
                      ⚠️ Error: {error}
                    </div>
                  ) : mineData.length > 0 ? (
                    <RawAnomalyMap mineData={mineData} />
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-8">
                      <div className="text-5xl mb-4">📦</div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-2">No Data Available</h3>
                      <p className="text-blue-700 mb-6 text-lg">This mine hasn't been processed yet.</p>
                      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 text-left max-w-md mx-auto mb-6 rounded">
                        <p className="text-blue-800 font-semibold text-sm mb-2">ℹ️ How to view analysis:</p>
                        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                          <li>Go to <span className="font-bold">Admin Panel</span></li>
                          <li>Select this mine (Mine {properties.mine_id})</li>
                          <li>Choose a date range</li>
                          <li>Click <span className="font-bold">"Run Pipeline"</span></li>
                          <li>Wait for processing to complete</li>
                          <li>Return to analysis to see results</li>
                        </ol>
                      </div>
                      <p className="text-gray-600 text-sm">Model will fetch satellite data and perform analysis</p>
                    </div>
                  )}
                </div>
              )}

              {/* Final Excavation Map Tab */}
              {activeTab === 'finalexcavation' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-slate-100">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      <p className="mt-4 text-slate-600 font-medium">Loading data...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold">
                      ⚠️ Error: {error}
                    </div>
                  ) : mineData.length > 0 ? (
                    <FinalExcavationMap mineData={mineData} />
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-8">
                      <div className="text-5xl mb-4">📦</div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-2">No Data Available</h3>
                      <p className="text-blue-700 mb-6 text-lg">This mine hasn't been processed yet.</p>
                      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 text-left max-w-md mx-auto mb-6 rounded">
                        <p className="text-blue-800 font-semibold text-sm mb-2">ℹ️ How to view analysis:</p>
                        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                          <li>Go to <span className="font-bold">Admin Panel</span></li>
                          <li>Select this mine (Mine {properties.mine_id})</li>
                          <li>Choose a date range</li>
                          <li>Click <span className="font-bold">"Run Pipeline"</span></li>
                          <li>Wait for processing to complete</li>
                          <li>Return to analysis to see results</li>
                        </ol>
                      </div>
                      <p className="text-gray-600 text-sm">Model will fetch satellite data and perform analysis</p>
                    </div>
                  )}
                </div>
              )}

              {/* Violation Area Over Time Tab */}
              {activeTab === 'violationtime' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-slate-100">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      <p className="mt-4 text-slate-600 font-medium">Loading data...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold">
                      ⚠️ Error: {error}
                    </div>
                  ) : mineData.length > 0 ? (
                    <ViolationAreaOverTime mineData={mineData} />
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-8">
                      <div className="text-5xl mb-4">📦</div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-2">No Data Available</h3>
                      <p className="text-blue-700 mb-6 text-lg">This mine hasn't been processed yet.</p>
                      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 text-left max-w-md mx-auto mb-6 rounded">
                        <p className="text-blue-800 font-semibold text-sm mb-2">ℹ️ How to view analysis:</p>
                        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                          <li>Go to <span className="font-bold">Admin Panel</span></li>
                          <li>Select this mine (Mine {properties.mine_id})</li>
                          <li>Choose a date range</li>
                          <li>Click <span className="font-bold">"Run Pipeline"</span></li>
                          <li>Wait for processing to complete</li>
                          <li>Return to analysis to see results</li>
                        </ol>
                      </div>
                      <p className="text-gray-600 text-sm">Model will fetch satellite data and perform analysis</p>
                    </div>
                  )}
                </div>
              )}

              {/* Excavation vs Violations Compliance Trend Tab */}
              {activeTab === 'compliancetrend' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-slate-100">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      <p className="mt-4 text-slate-600 font-medium">Loading data...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold">
                      ⚠️ Error: {error}
                    </div>
                  ) : mineData.length > 0 ? (
                    <ExcavationVsViolationsTimeSeries mineData={mineData} />
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-8">
                      <div className="text-5xl mb-4">📦</div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-2">No Data Available</h3>
                      <p className="text-blue-700 mb-6 text-lg">This mine hasn't been processed yet.</p>
                      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 text-left max-w-md mx-auto mb-6 rounded">
                        <p className="text-blue-800 font-semibold text-sm mb-2">ℹ️ How to view analysis:</p>
                        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                          <li>Go to <span className="font-bold">Admin Panel</span></li>
                          <li>Select this mine (Mine {properties.mine_id})</li>
                          <li>Choose a date range</li>
                          <li>Click <span className="font-bold">"Run Pipeline"</span></li>
                          <li>Wait for processing to complete</li>
                          <li>Return to analysis to see results</li>
                        </ol>
                      </div>
                      <p className="text-gray-600 text-sm">Model will fetch satellite data and perform analysis</p>
                    </div>
                  )}
                </div>
              )}

              {/* No-Go Zone Violations Tab */}
              {activeTab === 'nogozones' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-slate-100">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      <p className="mt-4 text-slate-600 font-medium">Loading data...</p>
                    </div>
                  ) : error ? (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-semibold">
                      ⚠️ Error: {error}
                    </div>
                  ) : mineData.length > 0 ? (
                    <NoGoZoneViolations mineData={mineData} />
                  ) : (
                    <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 p-8">
                      <div className="text-5xl mb-4">📦</div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-2">No Data Available</h3>
                      <p className="text-blue-700 mb-6 text-lg">This mine hasn't been processed yet.</p>
                      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 text-left max-w-md mx-auto mb-6 rounded">
                        <p className="text-blue-800 font-semibold text-sm mb-2">ℹ️ How to view analysis:</p>
                        <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                          <li>Go to <span className="font-bold">Admin Panel</span></li>
                          <li>Select this mine (Mine {properties.mine_id})</li>
                          <li>Choose a date range</li>
                          <li>Click <span className="font-bold">"Run Pipeline"</span></li>
                          <li>Wait for processing to complete</li>
                          <li>Return to analysis to see results</li>
                        </ol>
                      </div>
                      <p className="text-gray-600 text-sm">Model will fetch satellite data and perform analysis</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
