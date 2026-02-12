import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  useLocation
} from 'react-router-dom';

import { useAuth } from './hooks/useAuth';
import { fetchVideos } from './api/video';

import { LoginForm } from './components/Auth/LoginForm';
import { Navbar } from './components/Navbar/Navbar';
import { VideoList } from './components/Videos/VideoList';
import { VideoPlayer } from './components/Videos/VideoPlayer';
import { UploadVideo } from './components/Videos/UploadVideo';
import { HomePage } from './components/HomePage/HomePage';

import './App.css';

/* ---------------- CATEGORIES CONSTANTS ---------------- */

const CATEGORIES = [
  { id: 'diecast', label: 'Diecast', icon: '🚗', description: 'Diecast manufacturing process' },
  { id: 'kakou', label: '加工 (Processing)', icon: '⚙️', description: 'Processing techniques' },
  { id: 'kumitate', label: '組立 (Assembly)', icon: '🔧', description: 'Assembly procedures' },
  { id: 'kaihatsu', label: '開発 (Development)', icon: '💡', description: 'Development process' }
];

/* ---------------- LAYOUT COMPONENT ---------------- */

const PageLayout = ({ children, title, subtitle, actions }) => (
  <main className="page-layout">
    <div className="page-header">
      <div className="page-header-content">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
    <div className="page-content">{children}</div>
  </main>
);

/* ---------------- CATEGORIES PAGE ---------------- */

const CategoriesPage = () => {
  const navigate = useNavigate();

  const handleCategoryClick = useCallback((categoryId) => {
    navigate(`/categories/${categoryId}`);
  }, [navigate]);

  return (
    <PageLayout 
      title="Training Categories" 
      subtitle="Select a category to start learning"
    >
      <div className="categories-grid">
        {CATEGORIES.map(({ id, label, icon, description }) => (
          <article
            key={id}
            className="category-card"
            onClick={() => handleCategoryClick(id)}
            onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(id)}
            role="button"
            tabIndex={0}
            aria-label={`Browse ${label} category`}
          >
            <div className="category-icon">{icon}</div>
            <div className="category-content">
              <h3 className="category-title">{label}</h3>
              <p className="category-description">{description}</p>
            </div>
            <span className="category-arrow" aria-hidden="true">→</span>
          </article>
        ))}
      </div>
    </PageLayout>
  );
};

/* ---------------- CATEGORY VIDEOS PAGE ---------------- */

const CategoryVideosPage = ({ videos }) => {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const categoryInfo = useMemo(() => 
    CATEGORIES.find(c => c.id === category) || { label: category, icon: '📁' },
    [category]
  );

  const filteredVideos = useMemo(() => 
    videos.filter(v => v.category === category),
    [videos, category]
  );

  const handleVideoSelect = useCallback((video) => {
    navigate(`/categories/${category}/${video.id}`, {
      state: { from: location.pathname }
    });
  }, [category, navigate, location.pathname]);

  const handleBack = useCallback(() => {
    navigate('/categories');
  }, [navigate]);

  if (!category) {
    return <Navigate to="/categories" replace />;
  }

  return (
    <PageLayout
      title={
        <div className="title-with-back">
          <button
            className="back-button"
            onClick={handleBack}
            aria-label="Back to categories"
          >
            ←
          </button>
          <span>{categoryInfo.label}</span>
        </div>
      }
      subtitle={`${filteredVideos.length} videos available`}
      actions={
        <div className="category-stats">
          <span className="stat-badge">
            {filteredVideos.filter(v => v.completed).length} completed
          </span>
        </div>
      }
    >
      <VideoList
        videos={filteredVideos}
        onSelect={handleVideoSelect}
        token={localStorage.getItem('token')}
      />
    </PageLayout>
  );
};

/* ---------------- SINGLE VIDEO PAGE ---------------- */

const VideoPage = ({ videos, onVideoComplete }) => {
  const { category, videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const video = useMemo(() => 
    videos.find(v => String(v.id) === videoId),
    [videos, videoId]
  );

  const categoryInfo = useMemo(() => 
    CATEGORIES.find(c => c.id === category),
    [category]
  );

  const handleComplete = useCallback((videoId) => {
    onVideoComplete?.(videoId);
  }, [onVideoComplete]);

  const handleBack = useCallback(() => {
    navigate(`/categories/${category}`, {
      state: { from: location.pathname }
    });
  }, [navigate, category, location.pathname]);

  if (!video) {
    return (
      <PageLayout title="Video Not Found">
        <div className="not-found">
          <span className="not-found-icon">🎬</span>
          <h2>Video not found</h2>
          <p>The video you're looking for doesn't exist or has been removed.</p>
          <button 
            className="back-to-categories"
            onClick={handleBack}
          >
            ← Back to {categoryInfo?.label || 'Category'}
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <div className="video-page">
      <div className="video-player-section">
        <button
          className="video-back-button"
          onClick={handleBack}
          aria-label="Back to videos"
        >
          ←
        </button>
        <VideoPlayer
          video={video}
          token={localStorage.getItem('token')}
          onComplete={handleComplete}
          autoPlay
        />
      </div>
      
      <div className="video-info-section">
        <div className="video-metadata">
          <div className="video-category-badge">
            {categoryInfo?.icon} {categoryInfo?.label}
          </div>
          <h1 className="video-title">{video.title}</h1>
          {video.description && (
            <p className="video-description">{video.description}</p>
          )}
          <div className="video-actions">
            <button
              className="video-action-button"
              onClick={handleBack}
            >
              More videos in this category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- ADMIN UPLOAD PAGE ---------------- */

const AdminUploadPage = ({ onUploadComplete }) => {
  const navigate = useNavigate();

  const handleUploadComplete = useCallback(() => {
    onUploadComplete?.();
    navigate('/categories');
  }, [onUploadComplete, navigate]);

  return (
    <PageLayout 
      title="Upload Training Video" 
      subtitle="Share knowledge with your team"
    >
      <UploadVideo onUploaded={handleUploadComplete} />
    </PageLayout>
  );
};

/* ---------------- PRIVATE ROUTE ---------------- */

const PrivateRoute = ({ children, user, requiredRole }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* ---------------- APP ---------------- */

function App() {
  const { user, setUser, logout } = useAuth();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideosData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const data = await fetchVideos(token);
      setVideos(data);
    } catch (err) {
      setError(err.message || 'Failed to load videos');
      console.error('Video fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVideosData();
  }, [fetchVideosData]);

  const handleVideoComplete = useCallback((videoId) => {
    setVideos(prevVideos => 
      prevVideos.map(v => 
        v.id === videoId 
          ? { ...v, completed: true }
          : v
      )
    );
  }, []);

  const handleUploadComplete = useCallback(() => {
    fetchVideosData();
  }, [fetchVideosData]);

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navbar user={user} logout={logout} />
        
        <div className="app-content">
          {isLoading && (
            <div className="app-loading">
              <div className="loading-spinner" />
              <span>Loading videos...</span>
            </div>
          )}

          {error && (
            <div className="app-error" role="alert">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button onClick={fetchVideosData}>Retry</button>
            </div>
          )}

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* Category Routes */}
            <Route path="/categories" element={<CategoriesPage />} />
            <Route
              path="/categories/:category"
              element={
                <PrivateRoute user={user}>
                  <CategoryVideosPage videos={videos} />
                </PrivateRoute>
              }
            />
            <Route
              path="/categories/:category/:videoId"
              element={
                <PrivateRoute user={user}>
                  <VideoPage 
                    videos={videos} 
                    onVideoComplete={handleVideoComplete}
                  />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/upload"
              element={
                <PrivateRoute user={user} requiredRole="admin">
                  <AdminUploadPage onUploadComplete={handleUploadComplete} />
                </PrivateRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;