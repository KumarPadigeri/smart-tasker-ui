// API Configuration
export const API_CONFIG = {
  // Base URL for all API calls
  BASE_URL: 'https://smart-tasker-p95e.onrender.com/smart-tasker/api',
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  
  // Task endpoints
  TASKS: {
    GET_ALL: '/tasks',
    GET_COMPLETED: '/tasks/completed',
    CREATE: '/task',
    UPDATE: (id: number) => `/task/${id}`,
    COMPLETE: (id: number) => `/task/${id}/complete`,
    DELETE: (id: number) => `/task/${id}`,
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token: string) => ({
  'accept': '*/*',
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Helper function to get auth headers without content type (for GET requests)
export const getAuthHeadersNoContent = (token: string) => ({
  'accept': '*/*',
  'Authorization': `Bearer ${token}`,
}); 