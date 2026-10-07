import React from 'react';

const Header = ({ totalMines, onAdminClick }) => {
  return (
    <header className="elegant-card bg-white border-b border-[#E4E2DE] px-6 py-4 z-30 m-2 rounded-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight text-[#1F2328]">
            ⛏️ Adaptive Mining Monitor
          </h1>
          <p className="text-[#6B6F76] text-sm font-normal">
            Advanced satellite monitoring • {totalMines || 0} sites • Real-time analysis
          </p>
        </div>
        <button
          onClick={onAdminClick}
          className="px-6 py-2 bg-[#3A5F7D] hover:bg-[#2F4A65] text-white rounded-lg font-medium transition flex items-center gap-2 border border-[#3A5F7D] active:opacity-90"
        >
          ⚙️ Admin Panel
        </button>
      </div>
    </header>
  );
};

export default Header;
