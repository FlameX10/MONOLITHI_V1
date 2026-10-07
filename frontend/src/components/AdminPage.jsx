import React, { useState } from 'react';

export function AdminPage({ onClose }) {
  const [selectedMines, setSelectedMines] = useState(
    Array.from({ length: 11 }, (_, i) => false) // Start with no mines selected
  );
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-08-01');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const toggleMine = (index) => {
    const newSelected = [...selectedMines];
    newSelected[index] = !newSelected[index];
    setSelectedMines(newSelected);
  };

  const toggleSelectAll = () => {
    const allSelected = selectedMines.every(Boolean);
    setSelectedMines(Array.from({ length: 11 }, () => !allSelected));
  };

  const handleRunPipeline = async () => {
    setLoading(true);
    setError(null);
    setProgress([]);
    setCompleted([]);

    const selectedMineIds = selectedMines
      .map((selected, index) => (selected ? index : null))
      .filter(id => id !== null);

    for (const mineId of selectedMineIds) {
      try {
        setProgress(prev => [...prev, `⚙️ Processing Mine ${mineId}...`]);

        const response = await fetch(
          `${API_URL}/admin/run?mine_id=${mineId}&start_date=${startDate}&end_date=${endDate}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCompleted(prev => [...prev, `✅ Mine ${mineId}: ${data.message || 'Success'}`]);
      } catch (err) {
        setCompleted(prev => [...prev, `❌ Mine ${mineId}: ${err.message}`]);
      }
    }

    setLoading(false);
    setProgress([]);
  };

  return (
    <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="elegant-card bg-white rounded-lg shadow-sm max-w-3xl w-full mx-4 max-h-[92vh] overflow-y-auto border border-[#E4E2DE]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E4E2DE] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1F2328] mb-1">
                Mining Pipeline Analysis
              </h1>
              <p className="text-[#6B6F76] text-sm font-normal">Advanced ML analysis system</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-[#6B6F76] hover:text-[#1F2328] hover:bg-[#F7F6F4] rounded-lg w-10 h-10 flex items-center justify-center transition text-xl border border-[#E4E2DE] hover:border-[#3A5F7D] disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Date Range Selection */}
          <div className="elegant-card bg-[#F7F6F4] p-4 rounded-lg border border-[#E4E2DE]">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📅</span>
              <h2 className="font-semibold text-[#1F2328]">Date Range</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-[#1F2328] font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-white border border-[#E4E2DE] text-[#1F2328] rounded-lg focus:outline-none focus:border-[#3A5F7D] focus:ring-1 focus:ring-[#3A5F7D]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#1F2328] font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-white border border-[#E4E2DE] text-[#1F2328] rounded-lg focus:outline-none focus:border-[#3A5F7D] focus:ring-1 focus:ring-[#3A5F7D]"
                />
              </div>
            </div>
          </div>

          {/* Mine Selection */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏭</span>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">Select Mines</h2>
                  <p className="text-xs text-slate-600">Choose mines for analysis</p>
                </div>
              </div>
              <button
                onClick={toggleSelectAll}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedMines.every(Boolean) ? '✓ Deselect All' : '□ Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {Array.from({ length: 11 }, (_, i) => i).map((mineId) => (
                <button
                  key={mineId}
                  onClick={() => toggleMine(mineId)}
                  disabled={loading}
                  className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all border-2 ${
                    selectedMines[mineId]
                      ? 'bg-gradient-to-br from-blue-400 to-blue-500 border-blue-600 text-white shadow-md'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  M{mineId}
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <p className="text-sm text-slate-700">
                Selected: <span className="font-bold text-blue-600">{selectedMines.filter(Boolean).length}</span> / <span className="font-bold text-slate-900">11</span> mines
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border-2 border-red-300 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-bold text-red-900 mb-1">Error</p>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {progress.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-300 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-5 w-5 border-3 border-blue-600 border-t-transparent"></div>
                <p className="font-bold text-blue-900 text-lg">Processing...</p>
              </div>
              <div className="bg-white rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                {progress.map((msg, idx) => (
                  <p key={idx} className="text-xs text-slate-700 font-mono bg-slate-50 p-2 rounded">{msg}</p>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border-2 border-emerald-300 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✅</span>
                <p className="font-bold text-emerald-900">Results</p>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {completed.map((msg, idx) => (
                  <div key={idx} className="text-xs text-emerald-800 font-mono bg-white px-3 py-2 rounded border border-emerald-200">
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t-2 border-slate-200">
            <button
              onClick={handleRunPipeline}
              disabled={loading || selectedMines.filter(Boolean).length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>⚙️ Run Pipeline</>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold transition-all disabled:opacity-50"
              type="button"
            >
              ← Back
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🔬</span>
              <p className="font-bold text-lg text-indigo-900">Pipeline Features</p>
            </div>
            <ul className="space-y-3 text-indigo-900">
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold mt-0.5">✓</span>
                <span className="text-sm">Fetches satellite imagery from Google Earth Engine</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold mt-0.5">✓</span>
                <span className="text-sm">Computes spectral indices (NDVI, NBR, EVI)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold mt-0.5">✓</span>
                <span className="text-sm">Runs advanced ML anomaly detection</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold mt-0.5">✓</span>
                <span className="text-sm">Detects mining excavation patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#3A5F7D] mt-0.5">▸</span>
                <span>Stores analysis results in database</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
