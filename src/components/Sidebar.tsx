import { useNavigate, useLocation } from 'react-router-dom';
import { ListTodo, CheckSquare, User, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const handleLogout = () => {
    // Clear JWT token from localStorage
    localStorage.removeItem('jwtToken');
    // Clear user profile from session storage
    sessionStorage.removeItem('userProfile');
    // Redirect to login page
    navigate('/login');
  };

  const navItems = [
    { label: 'Tasks', icon: ListTodo, path: '/' },
    { label: 'Completed', icon: CheckSquare, path: '/completed' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col justify-between px-6 py-8 shadow-sm">
      <div>
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md">
            {/* Your leaf svg */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8 6 2 12 2 16a10 10 0 0020 0c0-4-6-10-10-14z" />
              </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Smart Tasker</span>
        </div>
        <nav className="space-y-2">
          {navItems.map(({ label, icon: Icon, path }) => (
            <div
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                location.pathname === path 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </div>
          ))}
          {/* Logout button with separate handler */}
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 mt-8 border-t border-gray-100 dark:border-slate-800 pt-4"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </div>
        </nav>
      </div>
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-slate-800 pt-4">© 2025 Smart Tasker</div>
    </aside>
  );
};

export default Sidebar;
