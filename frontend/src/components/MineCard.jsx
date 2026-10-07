import React from 'react';

const MineCard = ({ mine, isSelected, onSelect }) => {
  const handleClick = () => {
    onSelect(mine);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 border rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'elegant-card bg-[#F0F4F8] border-[#3A5F7D] border-opacity-40'
          : 'elegant-card bg-white border-[#E4E2DE] hover:border-[#D4D1CC]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className={`font-semibold mb-2 truncate flex-1 ${isSelected ? 'text-[#3A5F7D]' : 'text-[#1F2328]'}`}>
          {mine.properties.display_name}
        </h3>
        {mine.properties.pinned && (
          <span className="inline-block bg-[#8B7A5E] text-white text-xs px-2 py-1 rounded font-medium flex-shrink-0">
            📌
          </span>
        )}
      </div>
      <div className={`space-y-1 text-sm ${isSelected ? 'text-[#3A5F7D]' : 'text-[#6B6F76]'}`}>
        <p>
          <span className="font-medium text-[#1F2328]">State:</span> {mine.properties.state}
        </p>
        <p>
          <span className="font-medium text-[#1F2328]">District:</span> {mine.properties.district}
        </p>
        <p>
          <span className="font-medium text-[#1F2328]">Sub-district:</span> {mine.properties.subdistrict}
        </p>
        <p className="text-xs mt-2 text-[#6B6F76]">
          📍 {mine.geometry.coordinates[1].toFixed(4)}, {mine.geometry.coordinates[0].toFixed(4)}
        </p>
      </div>
      {isSelected && (
        <div className="mt-2 pt-2 border-t border-[#E4E2DE]">
          <span className="inline-block bg-[#E8F1F7] text-[#3A5F7D] text-xs px-3 py-1 rounded font-medium">
            ✓ Selected
          </span>
        </div>
      )}
    </div>
  );
};

export default MineCard;
