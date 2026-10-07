import minesData from '../data/mines.json';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getMinesData = () => {
  return minesData;
};

export const fetchMineDetails = async (mineId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/mine/details/${mineId}`);
    if (!response.ok) throw new Error(`Failed to fetch mine details: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching mine details:', error);
    throw error;
  }
};

export const fetchMineKPI = async (mineId, startDate = null, endDate = null) => {
  try {
    const url = new URL(`${API_BASE_URL}/mine/kpi/${mineId}`);
    if (startDate) url.searchParams.append('start', startDate);
    if (endDate) url.searchParams.append('end', endDate);
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Failed to fetch KPI: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching KPI:', error);
    throw error;
  }
};

export const fetchPixelData = async (mineId, startDate = null, endDate = null) => {
  try {
    const params = new URLSearchParams({ mine_id: mineId });
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    const response = await fetch(`${API_BASE_URL}/mine/pixels?${params}`);
    if (!response.ok) throw new Error(`Failed to fetch pixel data: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching pixel data:', error);
    throw error;
  }
};
