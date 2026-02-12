import { memo, useCallback } from 'react';
import '../Styles/Video.css';

export const VideoCard = memo(({ 
  video, 
  onSelect, 
  progress = 0, 
  completed = false,
  thumbnail,
  duration,
  category 
}) => {
  const handleClick = useCallback(() => {
    onSelect(video);
  }, [onSelect, video]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(video);
    }
  }, [onSelect, video]);

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min(Math.max(progress, 0), 100);
  const isCompleted = completed || progressPercentage === 100;

  return (
    <article 
      className="video-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Watch ${video.title}${isCompleted ? ' - Completed' : ''}`}
    >
      <div className="video-card-thumbnail">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt="" 
            aria-hidden="true"
            loading="lazy"
          />
        ) : (
          <div className="thumbnail-placeholder">
            <span className="placeholder-icon">🎬</span>
          </div>
        )}
        
        {duration && (
          <span className="video-duration">
            {formatDuration(duration)}
          </span>
        )}
        
        {category && (
          <span className="video-category-badge">
            {category}
          </span>
        )}
        
        {isCompleted && (
          <div className="completed-overlay" aria-hidden="true">
            <span className="completed-icon">✓</span>
          </div>
        )}
      </div>

      <div className="video-card-content">
        <div className="video-card-header">
          <h3 className="video-title">{video.title}</h3>
          {isCompleted && (
            <span className="completed-badge" role="status">
              <span className="badge-icon">✓</span>
              Completed
            </span>
          )}
        </div>

        {video.description && (
          <p className="video-description">{video.description}</p>
        )}

        <div className="video-progress">
          <div className="progress-header">
            <span className="progress-label">
              {isCompleted ? 'Completed' : 'Progress'}
            </span>
            <span className="progress-percentage">
              {isCompleted ? '100%' : `${progressPercentage}%`}
            </span>
          </div>
          
          <div 
            className="progress-track"
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`${progressPercentage}% watched`}
          >
            <div 
              className={`progress-fill ${isCompleted ? 'completed' : ''}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
});

VideoCard.displayName = 'VideoCard';