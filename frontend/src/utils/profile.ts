import { getAccessToken } from './auth';

const API_BASE_URL = 'http://localhost:8000/api';

export interface UserProfile {
  current_mood: string;
  primary_concerns: string;
  coping_strategies: string;
  id?: number;
  user_id?: number;
}

// Get the user's profile
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/profiles/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch profile');
    }
    
    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// Update the user's profile
export const updateUserProfile = async (profileData: UserProfile): Promise<UserProfile> => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/profiles/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_mood: profileData.current_mood,
        primary_concerns: profileData.primary_concerns,
        coping_strategies: profileData.coping_strategies
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to update profile');
    }
    
    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}; 