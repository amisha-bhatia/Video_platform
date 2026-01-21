import { useState } from 'react';
import { loginUser } from '../../api/video';

export const LoginForm = ({ setUser }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const data = await loginUser(id, password);
    if (!data) return setError('Invalid credentials');

    localStorage.setItem('token', data.token);
    setUser({ id: data.id, role: data.role });
  };

  return (
    <div className="login-card">
      <h2>Training Portal</h2>
      <input placeholder="User ID" value={id} onChange={e => setId(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};
