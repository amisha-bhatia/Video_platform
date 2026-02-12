import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import '../Styles/HomePage.css';
export const HomePage = () => {
  const navigate = useNavigate();

  const handleBrowseClick = useCallback(() => {
    navigate('/categories');
  }, [navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleBrowseClick();
    }
  }, [handleBrowseClick]);

  return (
    <main className="home">
      <div className="home-content">
        <div className="home-header">
          <span className="home-badge">Training Portal</span>
          <h1 className="home-title">
            Welcome to the Training Portal
            <span className="home-title-emoji" role="img" aria-label="video camera">🎬</span>
          </h1>
          <p className="home-subtitle">
            Select a category to start watching training videos.
          </p>
        </div>

        <button
          className="home-cta"
          onClick={handleBrowseClick}
          onKeyDown={handleKeyDown}
          aria-label="Browse video categories"
        >
          <span className="cta-text">Browse Categories</span>
          <span className="cta-icon" aria-hidden="true">→</span>
        </button>

        <div className="home-features">
          <div className="feature">
            <div className="feature-icon">📚</div>
            <h3 className="feature-title">Structured Learning</h3>
            <p className="feature-description">
              Organized categories for efficient skill development
            </p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3 className="feature-title">On-Demand Videos</h3>
            <p className="feature-description">
              Learn at your own pace, anytime, anywhere
            </p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Track Progress</h3>
            <p className="feature-description">
              Monitor your learning journey and achievements
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};