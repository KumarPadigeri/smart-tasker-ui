import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Plus, Check, Sun, Edit } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { getApiUrl, getAuthHeaders, getAuthHeadersNoContent, API_CONFIG } from '../config/api';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
}

const HomePage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);
  const [completingTasks, setCompletingTasks] = useState<Set<number>>(new Set());
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH',
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Get user profile from session storage
  const getUserName = () => {
    try {
      const userProfile = sessionStorage.getItem('userProfile');
      if (userProfile) {
        const user = JSON.parse(userProfile);
        return user.name;
      }
    } catch (error) {
      console.error('Error parsing user profile:', error);
    }
    return 'User'; // Fallback name
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(getApiUrl(API_CONFIG.TASKS.GET_ALL), {
        method: 'GET',
        headers: getAuthHeadersNoContent(token),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const tasksData = await response.json();
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      return; // Don't submit if title is empty
    }

    setModalLoading(true);
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(getApiUrl(API_CONFIG.TASKS.CREATE), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
          priority: newTask.priority,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const createdTask = await response.json();
      
      // Add the new task to the local state
      setTasks([...tasks, createdTask]);
      
      // Reset form and close modal
      setNewTask({ title: '', description: '', dueDate: '', priority: 'LOW' });
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !editingTask.title.trim()) {
      return;
    }

    setEditModalLoading(true);
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(getApiUrl(API_CONFIG.TASKS.UPDATE(editingTask.id)), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          dueDate: editingTask.dueDate,
          priority: editingTask.priority,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      
      // Update the task in local state
      setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
      
      // Reset form and close modal
      setEditingTask(null);
      setShowEditModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setEditModalLoading(false);
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const markAsComplete = async (taskId: number) => {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Add task to completing set to show loading state
    setCompletingTasks(prev => new Set(prev).add(taskId));

    try {
      const response = await fetch(getApiUrl(API_CONFIG.TASKS.COMPLETE(taskId)), {
        method: 'PATCH',
        headers: getAuthHeadersNoContent(token),
      });

      if (!response.ok) {
        throw new Error('Failed to mark task as completed');
      }

      // Update local state to mark task as completed
      setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: true } : task));
    } catch (err: any) {
      setError(err.message || 'Failed to mark task as completed');
    } finally {
      // Remove task from completing set
      setCompletingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p>Loading tasks...</p>
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
      <Sidebar />

      <main className="flex-1 p-10">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold">Hey {getUserName()}! 👋</h1>
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

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20 transition">
            <Plus size={16} />
            Add Task
          </button>
        </div>

        <div className="space-y-4">
          {tasks.filter(t => !t.completed).map((task) => (
            <div key={task.id} className="bg-white/80 dark:bg-white/5 p-4 rounded-lg flex justify-between items-center shadow-sm dark:shadow-none">
              <div>
                <p className="font-medium mb-1">{task.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{task.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(task.dueDate).toLocaleString()}</p>
              </div>
              <div className="flex gap-4 items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  task.priority === 'HIGH' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                  task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-300' :
                  'bg-green-500/20 text-green-600 dark:text-green-300'}`}>{task.priority}</span>
                <button 
                  onClick={() => openEditModal(task)}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => markAsComplete(task.id)} 
                  className="hover:text-green-600 dark:hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={completingTasks.has(task.id)}
                >
                  {completingTasks.has(task.id) ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 dark:border-green-400"></div>
                  ) : (
                    <Check size={18} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] rounded-2xl max-w-sm w-full shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gray-100 dark:bg-gradient-to-r dark:from-[#1e293b] dark:to-[#334155] px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-200 dark:bg-white/10 p-1.5 rounded-lg">
                    <Plus size={16} className="text-gray-700 dark:text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Task</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-4 space-y-4">
              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="Enter task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-transparent transition-all duration-200 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Description
                </label>
                <textarea
                  placeholder="Add task description..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-transparent transition-all duration-200 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                />
              </div>

              {/* Due Date Field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Due Date & Time
                </label>
                <DatePicker
                  selected={newTask.dueDate ? new Date(newTask.dueDate) : null}
                  onChange={(date) =>
                    setNewTask({ ...newTask, dueDate: date?.toISOString() ?? '' })
                  }
                  showTimeSelect
                  dateFormat="MMM dd, yyyy h:mm aa"
                  placeholderText="Select due date & time"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-transparent transition-all duration-200 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Priority Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => {
                    const isSelected = newTask.priority === level;
                    const styles = {
                      LOW: isSelected 
                        ? 'bg-green-500/20 border-green-500 text-green-600 dark:text-green-400' 
                        : 'bg-white dark:bg-white/5 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-400',
                      MEDIUM: isSelected 
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-600 dark:text-yellow-400' 
                        : 'bg-white dark:bg-white/5 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:border-yellow-500/50 hover:text-yellow-600 dark:hover:text-yellow-400',
                      HIGH: isSelected 
                        ? 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400' 
                        : 'bg-white dark:bg-white/5 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400',
                    } as const;
                    return (
                      <button
                        key={level}
                        onClick={() => setNewTask({ ...newTask, priority: level })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${styles[level]}`}
                      >
                        {level.charAt(0) + level.slice(1).toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3">
                <button
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-blue-600 dark:bg-white/20 hover:bg-blue-700 dark:hover:bg-white/30 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddTask}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
              
              {/* Error Display */}
              {error && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] rounded-2xl max-w-sm w-full shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gray-100 dark:bg-gradient-to-r dark:from-[#1e293b] dark:to-[#334155] px-4 py-3 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-200 dark:bg-white/10 p-1.5 rounded-lg">
                    <Edit size={16} className="text-gray-700 dark:text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Task</h2>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-4 space-y-4">
              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="Enter task title..."
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-transparent transition-all duration-200 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Description
                </label>
                <textarea
                  placeholder="Add task description..."
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-transparent transition-all duration-200 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                />
              </div>

              {/* Due Date Field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Due Date & Time
                </label>
                <DatePicker
                  selected={editingTask.dueDate ? new Date(editingTask.dueDate) : null}
                  onChange={(date) =>
                    setEditingTask({ ...editingTask, dueDate: date?.toISOString() ?? '' })
                  }
                  showTimeSelect
                  dateFormat="MMM dd, yyyy h:mm aa"
                  placeholderText="Select due date & time"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-transparent transition-all duration-200 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Priority Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => {
                    const isSelected = editingTask.priority === level;
                    const styles = {
                      LOW: isSelected 
                        ? 'bg-green-500/20 border-green-500 text-green-600 dark:text-green-400' 
                        : 'bg-white dark:bg-white/5 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-400',
                      MEDIUM: isSelected 
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-600 dark:text-yellow-400' 
                        : 'bg-white dark:bg-white/5 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:border-yellow-500/50 hover:text-yellow-600 dark:hover:text-yellow-400',
                      HIGH: isSelected 
                        ? 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400' 
                        : 'bg-white dark:bg-white/5 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400',
                    } as const;
                    return (
                      <button
                        key={level}
                        onClick={() => setEditingTask({ ...editingTask, priority: level })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${styles[level]}`}
                      >
                        {level.charAt(0) + level.slice(1).toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3">
                <button
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowEditModal(false)}
                  disabled={editModalLoading}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-blue-600 dark:bg-white/20 hover:bg-blue-700 dark:hover:bg-white/30 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleUpdateTask}
                  disabled={editModalLoading}
                >
                  {editModalLoading ? 'Updating...' : 'Update Task'}
                </button>
              </div>
              
              {/* Error Display */}
              {error && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
