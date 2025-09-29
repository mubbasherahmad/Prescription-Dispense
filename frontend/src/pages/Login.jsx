import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/landing'); // Redirect to landing page after login
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-logo">
            Prescript<span className="logo-highlight">Ease</span>
          </h1>
          <h2 className="login-title">Log in to your account</h2>
          <p className="login-subtitle">Welcome! Please enter your details.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email*</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password*</label>
            <div className="password-input-container">
              <input
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="form-input"
                required
              />
              <button type="button" className="password-toggle">
                Unhide
              </button>
            </div>
          </div>
          
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
        
        <div className="login-footer">
          <p className="signup-text">
            Don't have an account? {' '}
            <Link to="/register" className="signup-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;