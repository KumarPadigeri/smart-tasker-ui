import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ListTodo, CheckSquare, Moon, Sun } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { getApiUrl, getAuthHeadersNoContent, API_CONFIG } from '../config/api';

interface CompletedTask {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
}

const CompletedPage = () => {
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(getApiUrl(API_CONFIG.TASKS.GET_COMPLETED), {
        method: 'GET',
        headers: getAuthHeadersNoContent(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch completed tasks');
      }

      const tasksData = await response.json();
      setCompletedTasks(tasksData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch completed tasks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p>Loading completed tasks...</p>
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
          <h1 className="text-2xl font-bold">Completed Tasks</h1>
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

        <div className="space-y-4">
          {completedTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No completed tasks found.</p>
            </div>
          ) : (
            completedTasks.map((task) => (
              <div key={task.id} className="bg-white/80 dark:bg-white/5 p-4 rounded-lg flex justify-between items-center shadow-sm dark:shadow-none">
                <div>
                  <p className="font-medium mb-1 line-through">{task.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 line-through">{task.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Due: {new Date(task.dueDate).toLocaleString()}</p>
                </div>
                <div className="flex gap-4 items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    task.priority === 'HIGH' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-300' :
                    'bg-green-500/20 text-green-600 dark:text-green-300'}`}>{task.priority}</span>
                  <span className="text-green-600 dark:text-green-400 text-sm font-semibold">Done</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default CompletedPage;