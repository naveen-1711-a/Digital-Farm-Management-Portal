import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaLock, FaSignInAlt, FaLeaf } from 'react-icons/fa';

function LoginPage({ initialRole = 'Overall Admin' }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: initialRole
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, role: initialRole }));
  }, [initialRole]);



  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError('');

    // Enforce allowed roles rule
    if (formData.role !== 'Farm Admin' && formData.role !== 'Overall Admin' && formData.role !== 'Manager') {
      setServerError('Access Restricted: Selected role is not allowed to log in at this portal.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email, password: formData.password, role: formData.role })
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || 'Login failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'overall_admin') {
        window.location.hash = 'admin-dashboard';
      } else if (data.user.role === 'farm_admin') {
        window.location.hash = 'farm-dashboard';
      } else if (data.user.role === 'manager' || data.user.role === 'farm_manager') {
        window.location.hash = 'manager-dashboard';
      } else {
        // For other roles, just go home for now
        window.location.hash = 'home';
      }
    } catch (err) {
      console.error('Login error:', err);
      setServerError('Unable to reach the server. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Voice Assistant Events
  useEffect(() => {
    const handleVoiceEmail = (e) => setFormData(prev => ({ ...prev, email: e.detail }));
    const handleVoicePassword = (e) => setFormData(prev => ({ ...prev, password: e.detail }));
    const handleVoiceSubmit = () => {
      const syntheticEvent = { preventDefault: () => {} };
      handleSubmit(syntheticEvent);
    };

    window.addEventListener('voice-fill-email', handleVoiceEmail);
    window.addEventListener('voice-fill-password', handleVoicePassword);
    window.addEventListener('voice-submit-login', handleVoiceSubmit);

    return () => {
      window.removeEventListener('voice-fill-email', handleVoiceEmail);
      window.removeEventListener('voice-fill-password', handleVoicePassword);
      window.removeEventListener('voice-submit-login', handleVoiceSubmit);
    };
  }, [handleSubmit]);

  return (
    <div className="contact-page" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 8%' }}>
      <div className="contact-form-panel" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="contact-form-card" style={{ padding: '3rem', textAlign: 'center' }}>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)', fontSize: '2rem' }}>
              <FaLeaf />
            </div>
          </div>

          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Sign in to your FarmManager account</p>

          {/* Server Error Banner */}
          {serverError && (
            <div style={{
              background: '#fff0f0',
              border: '1px solid #f87171',
              color: '#b91c1c',
              padding: '0.85rem 1.25rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⚠️ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Select Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="Overall Admin">Overall Admin</option>
                <option value="Farm Admin">Farm Owner / Admin</option>
                <option value="Manager">Farm Manager</option>
                <option value="Veterinarian">Veterinarian</option>
                <option value="Worker">Farm Worker</option>
              </select>
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="name@example.com"
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ margin: 0 }}>Password</label>
                <a href="#forgot" style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <FaLock />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="••••••••"
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary large"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <span className="btn-spinner"></span> : <><FaSignInAlt /> Sign In</>}
            </button>

          </form>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <p style={{ margin: 0 }}>
              New to FarmManager? <br />
              <span style={{ fontSize: '0.9rem' }}>Only Farm Owners can register directly. Managers, Veterinarians, and Workers are invited by the Farm Admin.</span>
            </p>
            <a
              href="#register"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = 'register';
              }}
              style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}
            >
              Register your Farm →
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
