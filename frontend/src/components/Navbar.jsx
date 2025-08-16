import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <div className="bg-blue-50 text-gray-800 w-64 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-blue-200">
        <Link to="/" className="text-2xl font-bold text-blue-700">
          💊 PrescriptEase
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-6">
        <div className="px-4 space-y-2">
          <Link
            to="/prescriptions"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              isActive('/prescriptions')
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className={`mr-3 ${isActive('/prescriptions') ? 'text-white' : 'text-blue-600'}`}>
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            Prescriptions
          </Link>
          
          <Link
            to="/profile"
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              isActive('/profile')
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className={`mr-3 ${isActive('/profile') ? 'text-white' : 'text-blue-600'}`}>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Profile
          </Link>
        </div>
      </nav>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-blue-200">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-semibold text-white">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
