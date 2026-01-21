import { useNavigate } from 'react-router-dom';

export const Navbar = ({ user, logout }) => {
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="navbar">
      <div className="brand" onClick={() => navigate('/')}>
        Training Portal
      </div>

      <div className="nav-center">
        <button onClick={() => navigate('/')}>Home</button>
        {isAdmin && <button onClick={() => navigate('/upload')}>Upload</button>}
      </div>

      <div className="nav-right">
        <span>{user.id}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
};
