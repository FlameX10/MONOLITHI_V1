import React, { useState } from 'react';
import NDVIvsNBRScatter from './NDVIvsNBRScatter';

const MineDetailsPanel = ({ mine, onClose, onAnalysis }) => {
  const [activeTab, setActiveTab] = useState('info');

  if (!mine) return null;

  const { properties, geometry } = mine;
  const [lng, lat] = geometry.coordinates;

  return (
    <div className="absolute bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] elegant-card bg-white rounded-lg shadow-sm overflow-hidden z-50 animate-fadeIn flex flex-col border border-[#E4E2DE]">
      {/* Header with close button */}
      <div className="elegant-card bg-[#F7F6F4] px-4 py-3 flex items-center gap-2 shrink-0 border-b border-[#E4E2DE]">
        <h2 className="text-base font-semibold text-[#1F2328] truncate flex-1 min-w-0">{properties.display_name}</h2>
        <button
          onClick={() => onAnalysis(mine)}
          className="bg-[#3A5F7D] hover:bg-[#2F4A65] text-white px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1 whitespace-nowrap flex-shrink-0 border border-[#3A5F7D]"
          title="Open detailed analysis on full page"
        >
          📊 Analyze
        </button>
        <button
          onClick={onClose}
          className="text-[#6B6F76] hover:text-[#1F2328] hover:bg-[#E8E6E1] rounded w-7 h-7 flex items-center justify-center transition flex-shrink-0 text-lg leading-none border border-[#E4E2DE]"
          aria-label="Close details"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E4E2DE] bg-white shrink-0">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'info'
              ? 'border-[#3A5F7D] text-[#3A5F7D]'
              : 'border-transparent text-[#6B6F76] hover:text-[#1F2328]'
          }`}
        >
          Mine Info
        </button>
        <button
          onClick={() => setActiveTab('spectral')}
          className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'spectral'
              ? 'border-[#3A5F7D] text-[#3A5F7D]'
              : 'border-transparent text-[#6B6F76] hover:text-[#1F2328]'
          }`}
        >
          Spectral Data
        </button>
      </div>

      {/* Details Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'info' ? (
          <div className="p-4 space-y-3 overflow-y-auto h-full custom-scrollbar">
        {/* Mine ID */}
        <div className="elegant-card bg-[#F7F6F4] p-3 rounded border border-[#E4E2DE]">
          <p className="text-xs text-[#6B6F76] uppercase tracking-wide font-medium">Mine ID</p>
          <p className="text-lg font-semibold text-[#3A5F7D] mt-1">{properties.mine_id}</p>
        </div>

        {/* State */}
        <div className="elegant-card bg-[#F7F6F4] p-3 rounded border border-[#E4E2DE]">
          <p className="text-xs text-[#6B6F76] uppercase tracking-wide font-medium">State</p>
          <p className="text-lg font-semibold text-[#1F2328] mt-1">{properties.state}</p>
        </div>

        {/* District */}
        <div className="elegant-card bg-[#F7F6F4] p-3 rounded border border-[#E4E2DE]">
          <p className="text-xs text-[#6B6F76] uppercase tracking-wide font-medium">District</p>
          <p className="text-lg font-semibold text-[#1F2328] mt-1">{properties.district}</p>
        </div>

        {/* Sub-district */}
        <div className="elegant-card bg-[#F7F6F4] p-3 rounded border border-[#E4E2DE]">
          <p className="text-xs text-[#6B6F76] uppercase tracking-wide font-medium">Sub-district</p>
          <p className="text-lg font-semibold text-[#1F2328] mt-1">{properties.subdistrict}</p>
        </div>

        {/* Analyze Button */}
        <button
          onClick={() => onAnalysis(mine)}
          className="w-full bg-[#3A5F7D] hover:bg-[#2F4A65] text-white font-semibold py-2 px-3 rounded transition flex items-center justify-center gap-2 text-sm border border-[#3A5F7D]"
        >
          ⚙️ Analyze This Mine
        </button>

        {/* Coordinates */}
        <div className="elegant-card bg-[#F7F6F4] p-3 rounded border border-[#E4E2DE]">
          <p className="text-xs text-[#6B6F76] uppercase tracking-wide font-medium mb-2">Coordinates</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[#6B6F76]">Latitude:</span>
              <span className="text-sm text-[#1F2328] font-mono font-medium">{lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[#6B6F76]">Longitude:</span>
              <span className="text-sm text-[#1F2328] font-mono font-medium">{lng.toFixed(6)}</span>
            </div>
          </div>
        </div>
      </div>
        ) : (
          <div className="p-4 h-full">
            <NDVIvsNBRScatter mineId={properties.mine_id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MineDetailsPanel;
