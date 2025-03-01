// Auth API utilities
import { jwtDecode } from 'jwt-decode';
import { cookies } from 'next/headers';

const API_BASE_URL = 'http://localhost:8000/api';

// Time constants
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface RegisterData {
  email: string;
  username: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthResponse {
  access_token?: string;
  token_type?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  detail?: string;
  message?: string;
}

// Helper for client-side operations
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict; Secure`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  }
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Strict; Secure`;
};

// Register a new user
export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login a user
export const loginUser = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    // Create URLSearchParams to format the data as application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }
    
    // Store the tokens in cookies
    if (data.access_token) {
      setCookie('accessToken', data.access_token, 1); // 1 day expiry for access token
      
      // Store username in localStorage for easier access
      try {
        const decoded = jwtDecode<{username: string}>(data.access_token);
        if (decoded.username) {
          localStorage.setItem('username', decoded.username);
        }
      } catch (e) {
        console.error('Failed to decode JWT token', e);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout - clear tokens from cookies
export const logoutUser = (): void => {
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
  localStorage.removeItem('username');
};

// Check if the user is logged in
export const isAuthenticated = (): boolean => {
  return !!getCookie('accessToken');
};

// Get the stored access token
export const getAccessToken = (): string | null => {
  return getCookie('accessToken');
};

// Get the current user data (if logged in)
export const getCurrentUser = async (): Promise<any> => {
  try {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('No access token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch user data');
    }
    
    return data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

// Check if we should show the mood popup (if it's been more than 24 hours since last check)
export const shouldShowMoodPopup = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if user is authenticated
  if (!isAuthenticated()) return false;
  
  const lastMoodCheck = localStorage.getItem('lastMoodCheck');
  
  // If no previous mood check, or if it's been more than 24 hours
  if (!lastMoodCheck) return true;
  
  const lastCheckTime = parseInt(lastMoodCheck, 10);
  const currentTime = Date.now();
  
  // Return true if it's been more than 24 hours since the last check
  return (currentTime - lastCheckTime) > ONE_DAY_MS;
}; 