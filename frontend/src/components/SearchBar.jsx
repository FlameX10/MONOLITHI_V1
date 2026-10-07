import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange, selectedState, onStateChange, states }) => {
  return (
    <div className="elegant-card bg-white p-3 rounded-lg space-y-3 border border-[#E4E2DE] m-3">
      {/* Search Input */}
      <div>
        <label className="block text-xs font-semibold text-[#1F2328] mb-1">Search</label>
        <input
          type="text"
          placeholder="Search mines..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-[#E4E2DE] rounded focus:border-[#3A5F7D] focus:ring-1 focus:ring-[#3A5F7D] outline-none transition bg-white text-sm text-[#1F2328] placeholder-[#6B6F76]"
        />
      </div>

      {/* State Filter */}
      <div>
        <label className="block text-xs font-semibold text-[#1F2328] mb-1">State</label>
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="w-full px-3 py-2 border border-[#E4E2DE] rounded focus:border-[#3A5F7D] focus:ring-1 focus:ring-[#3A5F7D] outline-none transition bg-white text-sm text-[#1F2328]"
        >
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {(searchTerm || selectedState) && (
        <button
          onClick={() => {
            onSearchChange('');
            onStateChange('');
          }}
          className="w-full px-3 py-2 bg-[#F7F6F4] hover:bg-[#E8E6E1] text-[#6B6F76] border border-[#E4E2DE] rounded transition font-medium text-xs"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default SearchBar;
