import { useNavigate, useLocation } from 'react-router-dom';
import '../Styles/Navbar.css';

export const Navbar = ({ user, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;
  const isCategoriesActive = location.pathname.startsWith('/categories');

  return (
    <header className="navbar">
      <nav className="navbar-container">
        {/* Brand */}
        <div 
          className="navbar-brand"
          onClick={() => handleNavigation('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNavigation('/')}
        >
          Training Portal
        </div>

        {/* Navigation */}
        <div className="navbar-nav">
          <button
            className={`nav-btn ${isActive('/') ? 'active' : ''}`}
            onClick={() => handleNavigation('/')}
          >
            Home
          </button>

          <button
            className={`nav-btn ${isCategoriesActive ? 'active' : ''}`}
            onClick={() => handleNavigation('/categories')}
          >
            Categories
          </button>

          {isAdmin && (
            <button
              className={`nav-btn ${isActive('/upload') ? 'active' : ''}`}
              onClick={() => handleNavigation('/upload')}
            >
              Upload
            </button>
          )}
        </div>

        {/* User */}
        <div className="navbar-user">
          <span className="user-badge">{user?.id}</span>
          <button 
            className="logout-btn" 
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
};