import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript, calculateBounds } from '../utils/mapsUtils';

const MapComponent = ({ mines, selectedMine, onMineSelect, isLoading }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [clickMarker, setClickMarker] = useState(null);
  const [error, setError] = useState(null);
  const markerRefsMap = useRef({});

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Initialize map
  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is not configured');
      return;
    }

    if (!mapRef.current) {
      return;
    }

    const initMap = async () => {
      try {
        await loadGoogleMapsScript(apiKey);

        const { center, zoom } = calculateBounds(mines);

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
        });

        setMap(mapInstance);
      } catch (err) {
        setError(err.message);
      }
    };

    initMap();
  }, [apiKey, mines]);

  // Create and update markers
  useEffect(() => {
    if (!map || !mines || mines.length === 0) return;

    // Clear existing markers
    Object.values(markerRefsMap.current).forEach((marker) => {
      marker.setMap(null);
    });
    markerRefsMap.current = {};

    // Create new markers for all mines
    mines.forEach((mine) => {
      const [lng, lat] = mine.geometry.coordinates;
      const isSelected = selectedMine && selectedMine.properties.mine_id === mine.properties.mine_id;
      const isPinned = mine.properties.pinned === true;

      // Determine marker icon based on pinned and selected status
      let iconUrl = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      if (isPinned) {
        iconUrl = isSelected 
          ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
          : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'; // Blue for pinned
      } else if (isSelected) {
        iconUrl = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      }

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: mine.properties.display_name,
        icon: iconUrl,
        zIndex: isPinned ? 1000 : (isSelected ? 999 : 0), // Pinned on top
      });

      // Store marker reference by mine ID for later updates
      markerRefsMap.current[mine.properties.mine_id] = marker;

      // Create info window with mine details
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 250px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${mine.properties.display_name}</h3>
            <div style="font-size: 12px; line-height: 1.6;">
              <p style="margin: 3px 0;"><strong>Mine ID:</strong> ${mine.properties.mine_id}</p>
              <p style="margin: 3px 0;"><strong>State:</strong> ${mine.properties.state}</p>
              <p style="margin: 3px 0;"><strong>District:</strong> ${mine.properties.district}</p>
              <p style="margin: 3px 0;"><strong>Sub-district:</strong> ${mine.properties.subdistrict}</p>
              <p style="margin: 3px 0;"><strong>Lat:</strong> ${lat.toFixed(6)}</p>
              <p style="margin: 3px 0;"><strong>Lng:</strong> ${lng.toFixed(6)}</p>
            </div>
          </div>
        `,
      });

      // Click marker to select mine
      marker.addListener('click', () => {
        onMineSelect(mine);
        infoWindow.open(map, marker);
      });

      // Show info window on hover
      marker.addListener('mouseover', () => {
        infoWindow.open(map, marker);
      });

      marker.addListener('mouseout', () => {
        infoWindow.close();
      });
    });

    setMarkers(Object.values(markerRefsMap.current));
  }, [map, mines, selectedMine, onMineSelect]);

  // Update marker colors when selected mine changes
  useEffect(() => {
    if (!selectedMine) return;

    mines.forEach((mine) => {
      const marker = markerRefsMap.current[mine.properties.mine_id];
      if (marker) {
        const isSelected = mine.properties.mine_id === selectedMine.properties.mine_id;
        marker.setIcon(
          isSelected
            ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            : 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
        );
      }
    });

    // Pan to selected mine
    if (selectedMine && map) {
      const [lng, lat] = selectedMine.geometry.coordinates;
      map.panTo({ lat, lng });
      map.setZoom(12);
    }
  }, [selectedMine, map, mines]);

  // Add map click to place location marker
  useEffect(() => {
    if (!map) return;

    const handleMapClick = (e) => {
      // Remove previous click marker
      if (clickMarker) {
        clickMarker.setMap(null);
      }

      // Create new marker at clicked location
      const newMarker = new window.google.maps.Marker({
        position: e.latLng,
        map,
        title: `${e.latLng.lat().toFixed(4)}, ${e.latLng.lng().toFixed(4)}`,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      });

      // Add info window to show coordinates
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <p style="margin: 0; font-size: 12px;"><strong>Latitude:</strong> ${e.latLng.lat().toFixed(6)}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;"><strong>Longitude:</strong> ${e.latLng.lng().toFixed(6)}</p>
          </div>
        `,
      });

      newMarker.addListener('click', () => {
        infoWindow.open(map, newMarker);
      });

      infoWindow.open(map, newMarker);
      setClickMarker(newMarker);
    };

    const listener = map.addListener('click', handleMapClick);

    return () => {
      // Google Maps listener.remove() may not be available in all versions
      // Just return without cleanup to avoid errors
    };
  }, [map, clickMarker]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error loading map</p>
          <p className="text-red-500 text-sm">{error}</p>
          <p className="text-gray-600 text-xs mt-2">Please ensure your Google Maps API key is set in .env.local</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
};

export default MapComponent;
