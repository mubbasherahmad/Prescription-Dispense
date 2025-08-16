import Sidebar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">💊 PrescriptEase</h1>
            <p className="text-xl text-gray-600 mb-4">
              Your Digital Prescription Management Platform
            </p>
            <p className="text-gray-500 max-w-lg mx-auto">
              Streamline your prescription workflow with our easy-to-use digitalization system. 
              Manage prescriptions, track medications, and maintain patient records efficiently.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Started</h2>
            <p className="text-gray-600 mb-6">
              Join PrescriptEase today to digitize and manage your prescriptions
            </p>
            <div className="space-y-3">
              <Link
                to="/register"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold text-gray-900 mb-2">Digital Records</h3>
              <p className="text-sm text-gray-600">
                Convert paper prescriptions to digital format
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-gray-900 mb-2">Patient Management</h3>
              <p className="text-sm text-gray-600">
                Track patient information and medication history
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Storage</h3>
              <p className="text-sm text-gray-600">
                Keep prescription data safe and accessible
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;