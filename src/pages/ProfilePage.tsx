import { useState, useEffect } from 'react';
import { LogOut, User, ListTodo, CheckSquare, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { getApiUrl, getAuthHeadersNoContent, API_CONFIG } from '../config/api';

interface UserProfile {
  name: string;
  email: string;
}

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(getApiUrl(API_CONFIG.AUTH.ME), {
        method: 'GET',
        headers: getAuthHeadersNoContent(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
      setUserProfile(userData);
      
      // Store user data in session storage for use across the app
      sessionStorage.setItem('userProfile', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        <div className="bg-white/80 dark:bg-white/5 p-6 rounded-lg max-w-md shadow-sm dark:shadow-none">
          <p className="text-lg font-semibold mb-2">{userProfile?.name || 'Loading...'}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Email: {userProfile?.email || 'Loading...'}</p>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
 