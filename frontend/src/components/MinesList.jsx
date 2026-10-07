import React from 'react';
import MineCard from './MineCard';

const MinesList = ({ mines, selectedMine, onMineSelect, isLoading }) => {
  return (
    <div className="elegant-card bg-white rounded-lg p-4 h-full flex flex-col border border-[#E4E2DE] m-3 mt-0">
      {/* Header */}
      <div className="mb-4 border-b border-[#E4E2DE] pb-3">
        <h2 className="text-lg font-semibold text-[#1F2328]">Mines ({mines.length})</h2>
        <p className="text-sm text-[#6B6F76] mt-1">Click on a mine to view it on the map</p>
      </div>

      {/* Mines List */}
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-[#6B6F76] font-medium">Loading mines...</p>
          </div>
        ) : mines.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-[#6B6F76] font-medium">No mines found</p>
          </div>
        ) : (
          mines.map((mine) => (
            <MineCard
              key={mine.properties.mine_id}
              mine={mine}
              isSelected={selectedMine && selectedMine.properties.mine_id === mine.properties.mine_id}
              onSelect={onMineSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MinesList;
