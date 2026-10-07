// Track if we're already loading the script
let mapsLoadingPromise = null;
const callbackName = '__googleMapsCallback_' + Date.now();

// Utility function to load Google Maps script
export const loadGoogleMapsScript = (apiKey) => {
  // If already loaded, resolve immediately
  if (window.google && window.google.maps) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (mapsLoadingPromise) {
    return mapsLoadingPromise;
  }

  // Create new loading promise
  mapsLoadingPromise = new Promise((resolve, reject) => {
    // Check again in case it was loaded while we were setting up
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Set up callback function
    window[callbackName] = function() {
      if (window.google && window.google.maps) {
        resolve();
      } else {
        reject(new Error('Google Maps library did not initialize properly'));
      }
    };

    // Check if script already exists in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript && window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,visualization&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      mapsLoadingPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };
    
    document.head.appendChild(script);
  });

  return mapsLoadingPromise;
};

// Calculate center of all mines
export const calculateBounds = (mines) => {
  if (!mines || mines.length === 0) {
    return { center: { lat: 22.5, lng: 80 }, zoom: 5 }; // Default India center
  }

  let minLat = mines[0].geometry.coordinates[1];
  let maxLat = mines[0].geometry.coordinates[1];
  let minLng = mines[0].geometry.coordinates[0];
  let maxLng = mines[0].geometry.coordinates[0];

  mines.forEach((mine) => {
    const [lng, lat] = mine.geometry.coordinates;
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Calculate zoom level based on bounds
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);
  let zoom = 10;
  if (maxDiff > 5) zoom = 6;
  if (maxDiff > 10) zoom = 5;

  return { center: { lat: centerLat, lng: centerLng }, zoom };
};

// Filter mines by state or search term
export const filterMines = (mines, searchTerm, selectedState) => {
  let filtered = mines;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (mine) =>
        mine.properties.display_name.toLowerCase().includes(term) ||
        mine.properties.state.toLowerCase().includes(term) ||
        mine.properties.district.toLowerCase().includes(term)
    );
  }

  if (selectedState) {
    filtered = filtered.filter((mine) => mine.properties.state === selectedState);
  }

  return filtered;
};

// Get unique states from mines
export const getUniqueStates = (mines) => {
  const states = new Set();
  mines.forEach((mine) => {
    states.add(mine.properties.state);
  });
  return Array.from(states).sort();
};
