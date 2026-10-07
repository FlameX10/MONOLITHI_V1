// API Client for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = {
  /**
   * Fetch mine details by ID
   */
  async getMineDetails(mineId) {
    try {
      const response = await fetch(`${API_BASE_URL}/mine/details/${mineId}`);
      if (!response.ok) throw new Error(`Failed to fetch mine details: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching mine details:', error);
      throw error;
    }
  },

  /**
   * Fetch pixel-level spectral data
   */
  async getPixelData(mineId, startDate = null, endDate = null) {
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
  },

  /**
   * Fetch KPI metrics for a mine
   */
  async getMineKPI(mineId, startDate = null, endDate = null) {
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
  },

  /**
   * Fetch spectral signature (aggregated bands data)
   */
  async getSpectralSignature(mineId, startDate = null, endDate = null) {
    try {
      const url = new URL(`${API_BASE_URL}/mine/spectral-signature/${mineId}`);
      if (startDate) url.searchParams.append('start', startDate);
      if (endDate) url.searchParams.append('end', endDate);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`Failed to fetch spectral signature: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching spectral signature:', error);
      throw error;
    }
  },

  /**
   * Check backend health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
};
