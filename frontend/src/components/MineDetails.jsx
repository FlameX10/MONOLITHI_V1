import React from 'react';

const MineDetails = ({ mine }) => {
  if (!mine) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">Select a mine to view details</p>
      </div>
    );
  }

  const { properties, geometry } = mine;
  const [lng, lat] = geometry.coordinates;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{properties.display_name}</h2>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-xs text-gray-600 uppercase tracking-wide">State</p>
          <p className="text-lg font-semibold text-blue-600">{properties.state}</p>
        </div>

        <div className="bg-green-50 p-3 rounded">
          <p className="text-xs text-gray-600 uppercase tracking-wide">District</p>
          <p className="text-lg font-semibold text-green-600">{properties.district}</p>
        </div>

        <div className="bg-purple-50 p-3 rounded">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Sub-district</p>
          <p className="text-lg font-semibold text-purple-600">{properties.subdistrict}</p>
        </div>

        <div className="bg-orange-50 p-3 rounded">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Mine ID</p>
          <p className="text-lg font-semibold text-orange-600">{properties.mine_id}</p>
        </div>
      </div>

      {/* Coordinates */}
      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">Coordinates</h3>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Latitude:</span> {lat.toFixed(6)}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Longitude:</span> {lng.toFixed(6)}
        </p>
      </div>

      {/* View on Maps Button */}
      <button
        onClick={() => {
          window.open(
            `https://www.google.com/maps/@${lat},${lng},15z`,
            '_blank'
          );
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        📍 View on Google Maps
      </button>
    </div>
  );
};

export default MineDetails;
