import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiUrl, getAuthHeadersNoContent, API_CONFIG } from '../../config/api';

interface LoginFormState {
  email: string;
  password: string;
}

const LeafIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-white mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2C8 6 2 12 2 16a10 10 0 0020 0c0-4-6-10-10-14z"
    />
  </svg>
);

const LoginPage = () => {
  const [formData, setFormData] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.AUTH.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        // Try to parse error message from response
        let errorMsg = 'Login failed';
        try {
          const errData = await response.json();
          if (errData && errData.message) errorMsg = errData.message;
        } catch {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('jwtToken', data.token);
        
        // Fetch user profile with the token
        try {
          const profileRes = await fetch(getApiUrl(API_CONFIG.AUTH.ME), {
            method: 'GET',
            headers: getAuthHeadersNoContent(data.token),
          });
          if (profileRes.ok) {
            const userProfile = await profileRes.json();
            sessionStorage.setItem('userProfile', JSON.stringify(userProfile));
          }
        } catch (profileErr) {
          console.error('Failed to fetch user profile:', profileErr);
        }
        
        // Fetch all tasks with the token
        try {
          const tasksRes = await fetch(getApiUrl(API_CONFIG.TASKS.GET_ALL), {
            method: 'GET',
            headers: getAuthHeadersNoContent(data.token),
          });
          if (!tasksRes.ok) {
            throw new Error('Failed to fetch tasks');
          }
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
          // For now, just log tasks
          console.log('Fetched tasks:', tasksData);
          // Redirect to home or dashboard
          navigate('/');
        } catch (taskErr: any) {
          setError(taskErr.message || 'Failed to fetch tasks');
        }
      } else {
        setError('No token received');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] px-4">
      <div className="relative w-full max-w-sm">
        {/* Top glassy card */}
        <div
          className="
            absolute top-0 left-0 w-full h-24
            bg-black bg-opacity-30 backdrop-blur-md
            border border-white border-opacity-20
            rounded-2xl
            flex items-center justify-center
            shadow-md
            z-0
          "
        >
          <LeafIcon />
          <span className="text-white text-lg font-semibold select-none">
            Smart Tasker
          </span>
        </div>

        {/* Login card placed below glassy card */}
        <div className="relative mt-20 bg-white rounded-2xl shadow-2xl p-8 z-10">
          <h2 className="text-2xl font-bold text-left text-text-main mb-6">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm text-muted mb-1">

              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email Address"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-muted mb-1">

              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white py-2 rounded-lg transition duration-300"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && (
              <div className="text-red-600 text-sm text-center mt-2">{error}</div>
            )}

          </form>

          <div className="mt-6 text-center text-sm text-muted">
            <p>Don’t have an account?</p>
            <Link
              to="/register"
              className="inline-block mt-2 text-[#0f172a] hover:underline font-medium"
            >
              Register
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
