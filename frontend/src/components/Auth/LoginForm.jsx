import { useState, useCallback } from 'react';
import { loginUser } from '../../api/video';
import '../Styles/LoginForm.css';

export const LoginForm = ({ setUser }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!id.trim() || !password.trim()) {
      setError('Please enter both ID and password');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const data = await loginUser(id.trim(), password);
      
      if (!data) {
        setError('Invalid credentials');
        return;
      }

      localStorage.setItem('token', data.token);
      setUser({ id: data.id, role: data.role });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id, password, setUser]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  }, [handleLogin]);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to Training Portal</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              id="userId"
              type="text"
              placeholder="Enter your user ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
              aria-label="User ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Password"
            />
          </div>

          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
        </form>

        <div className="login-footer">
          <p className="demo-hint">
            Demo: Use any credentials
          </p>
        </div>
      </div>
    </div>
  );
};