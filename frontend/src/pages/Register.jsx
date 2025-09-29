

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/auth/register', formData);
      alert('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-logo">
            Prescript<span className="logo-highlight">Ease</span>
          </h1>
          <h2 className="register-title">Create Your Account</h2>
          <p className="register-subtitle">Please enter your details.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
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

          <div className="form-group">
            <label className="form-label">Confirm Password*</label>
            <div className="password-input-container">
              <input
                type="password"
                placeholder="Enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="form-input"
                required
              />
              <button type="button" className="password-toggle">
                Unhide
              </button>
            </div>
          </div>
          
          <button type="submit" className="register-button">
            Create Account
          </button>
        </form>
        
        <div className="register-footer">
          <p className="signin-text">
            Already have an account? {' '}
            <Link to="/login" className="signin-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;