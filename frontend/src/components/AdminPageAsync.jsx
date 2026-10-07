// frontend/src/components/AdminPageAsync.jsx - Async version with polling
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  submitPipeline,
  pollTaskStatus,
  toggleMine,
  toggleSelectAll,
  setDateRange
} from '../store/adminSlice';

export function AdminPageAsync({ onClose }) {
  const dispatch = useDispatch();
  const {
    selectedMines,
    startDate,
    endDate,
    tasks,
    loading,
    error
  } = useSelector(state => state.admin);

  const [activeTasks, setActiveTasks] = useState([]);

  // Poll active tasks every 3 seconds (less frequent to reduce server load)
  useEffect(() => {
    if (activeTasks.length === 0) return;

    const interval = setInterval(() => {
      activeTasks.forEach(taskId => {
        dispatch(pollTaskStatus(taskId));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTasks, dispatch]);

  // Remove completed tasks from polling
  useEffect(() => {
    setActiveTasks(prev =>
      prev.filter(taskId => {
        const task = tasks[taskId];
        return task && task.status !== 'completed' && task.status !== 'failed';
      })
    );
  }, [tasks]);

  const handleRunPipeline = async () => {
    const selectedMineIds = selectedMines
      .map((selected, index) => (selected ? index : null))
      .filter(id => id !== null);

    const newTasks = [];
    for (const mineId of selectedMineIds) {
      const result = await dispatch(submitPipeline({
        mineId,
        startDate,
        endDate
      }));
      if (result.payload?.task_id) {
        newTasks.push(result.payload.task_id);
      }
    }

    setActiveTasks(newTasks);
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
              <p className="text-[#6B6F76] text-sm font-normal">⚡ Async processing - Returns immediately</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#6B6F76] hover:text-[#1F2328] hover:bg-[#F7F6F4] rounded-lg w-10 h-10 flex items-center justify-center transition text-xl border border-[#E4E2DE]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Date Range */}
          <div className="elegant-card bg-[#F7F6F4] p-4 rounded-lg border border-[#E4E2DE]">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📅</span>
              <h2 className="font-semibold text-[#1F2328]">Date Range</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-[#1F2328] font-medium mb-2">Start</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => dispatch(setDateRange({ startDate: e.target.value, endDate }))}
                  className="w-full px-3 py-2 border border-[#E4E2DE] rounded-lg focus:outline-none focus:border-[#3A5F7D]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#1F2328] font-medium mb-2">End</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => dispatch(setDateRange({ startDate, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E4E2DE] rounded-lg focus:outline-none focus:border-[#3A5F7D]"
                />
              </div>
            </div>
          </div>

          {/* Mine Selection */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⛏️</span>
                <div>
                  <h2 className="font-bold text-lg text-slate-900">Select Mines</h2>
                  <p className="text-xs text-slate-600">Choose mines for pipeline processing</p>
                </div>
              </div>
              <button
                onClick={() => dispatch(toggleSelectAll())}
                className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                {selectedMines.every(Boolean) ? '✓ Deselect All' : '□ Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedMines.map((selected, i) => (
                <label 
                  key={i} 
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selected 
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-400 shadow-sm' 
                      : 'bg-white border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => dispatch(toggleMine(i))}
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer accent-blue-600"
                  />
                  <span className={`text-sm font-medium ${selected ? 'text-blue-900' : 'text-slate-700'}`}>
                    Mine {i}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <div className="elegant-card bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">📊 Processing Tasks</h3>
              {activeTasks.map(taskId => {
                const task = tasks[taskId];
                return (
                  <div key={taskId} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-blue-800">
                        Mine {task?.mine_id} · {taskId.slice(0, 8)}...
                      </span>
                      <span className="text-sm font-semibold text-blue-900">{task?.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${task?.progress || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      {task?.status === 'completed' ? '✅ Completed - Data ready!' : 
                       task?.status === 'failed' ? '❌ Failed - Check logs' :
                       task?.status === 'processing' ? `⚙️ ${task?.message || 'Processing...'}` : '⏳ Queued for processing'}
                    </p>
                    {task?.status === 'processing' && (
                      <p className="text-xs text-blue-600 mt-1">
                        ⏱️ This may take 2-5 minutes depending on data size and GEE availability
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Run Button */}
          <button
            onClick={handleRunPipeline}
            disabled={loading || activeTasks.length > 0}
            className="w-full px-6 py-3 bg-[#3A5F7D] text-white font-semibold rounded-lg hover:bg-[#2C4759] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '⏳ Submitting...' : activeTasks.length > 0 ? '⏳ Processing...' : '🚀 Run Pipeline'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">❌ {error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
