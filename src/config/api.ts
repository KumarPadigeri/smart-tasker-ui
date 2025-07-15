  // API Configuration
export const API_CONFIG = {
  // Base URL for all API calls
  BASE_URL: 'https://smart-tasker-p95e.onrender.com/smart-tasker/api',
  BASE_URL_REGISTER: 'https://smart-tasker-p95e.onrender.com/smart-tasker/api',
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register', // Will use BASE_URL_REGISTER
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

export const getApiUrl = (endpoint: string, useRegisterBase = false): string => {
  if (useRegisterBase) {
    return `${API_CONFIG.BASE_URL_REGISTER}${endpoint}`;
  }
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getAuthHeaders = (token: string) => ({
  'accept': '*/*',
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const getAuthHeadersNoContent = (token: string) => ({
  'accept': '*/*',
  'Authorization': `Bearer ${token}`,
}); 
