// Stats API utilities
import { getAccessToken } from './auth';

const API_BASE_URL = 'http://localhost:8000/api';

interface StatsResponse {
  total_count: number;
  by_level: {
    INFO: number;
    WARNING: number;
    ERROR: number;
    CRITICAL: number;
  };
  top_paths: Record<string, number>;
  period_days: number;
}

// Get app statistics
export const getStats = async (): Promise<StatsResponse> => {
  try {
    const token = getAccessToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization token if available (some APIs may not require auth)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/logs/stats`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch statistics');
    }
    
    return data;
  } catch (error) {
    console.error('Stats fetch error:', error);
    // Return default/empty data to avoid breaking the UI
    return {
      total_count: 0,
      by_level: { INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 },
      top_paths: {},
      period_days: 7
    };
  }
}; 