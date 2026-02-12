import { useEffect, useState, useMemo, useCallback } from 'react';
import { VideoCard } from './VideoCard';
import { fetchProgress } from '../../api/video';
import '../Styles/Video.css';

export const VideoList = ({ videos = [], onSelect, token }) => {
  const [progressMap, setProgressMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const videoIds = useMemo(() => 
    videos.map(v => v.id).join(','), 
    [videos]
  );

  const calculateProgress = useCallback((progress) => {
    if (!progress) return 0;
    if (progress.completed) return 100;
    if (progress.duration > 0 && progress.lastPosition >= 0) {
      return Math.min(100, Math.round((progress.lastPosition / progress.duration) * 100));
    }
    return 0;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      if (!videos.length || !token) {
        setProgressMap({});
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const ids = videos.map(v => v.id);
        const data = await fetchProgress(ids, token);
        
        if (!isMounted) return;

        const map = data.reduce((acc, progress) => {
          acc[progress.videoId] = {
            ...progress,
            percent: calculateProgress(progress)
          };
          return acc;
        }, {});
        
        setProgressMap(map);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load progress');
        console.error('Progress fetch error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, [videos, token, videoIds, calculateProgress]);

  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      const progressA = progressMap[a.id]?.percent || 0;
      const progressB = progressMap[b.id]?.percent || 0;
      
      // Sort by completion status first (incomplete first)
      const isCompletedA = progressA === 100;
      const isCompletedB = progressB === 100;
      
      if (isCompletedA !== isCompletedB) {
        return isCompletedA ? 1 : -1;
      }
      
      // Then by progress (higher first)
      if (progressA !== progressB) {
        return progressB - progressA;
      }
      
      // Finally by title
      return a.title.localeCompare(b.title);
    });
  }, [videos, progressMap]);

  const stats = useMemo(() => {
    const total = videos.length;
    const completed = Object.values(progressMap).filter(p => p.completed).length;
    const inProgress = Object.values(progressMap).filter(p => !p.completed && p.percent > 0).length;
    const notStarted = total - completed - inProgress;
    
    return { total, completed, inProgress, notStarted };
  }, [videos.length, progressMap]);

  if (!videos.length) {
    return (
      <div className="video-list-empty">
        <div className="empty-state">
          <span className="empty-icon">🎥</span>
          <h3>No videos found</h3>
          <p>There are no videos in this category yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-list-container">
      <div className="video-list-header">
        <div className="video-list-title">
          <h2>Training Videos</h2>
          <span className="video-count">{videos.length} videos</span>
        </div>
        
        <div className="video-stats">
          <div className="stat-item">
            <span className="stat-label">Completed</span>
            <span className="stat-value completed">{stats.completed}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-label">In Progress</span>
            <span className="stat-value in-progress">{stats.inProgress}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-label">Not Started</span>
            <span className="stat-value not-started">{stats.notStarted}</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="video-list-loading">
          <div className="loading-spinner" />
          <span>Loading your progress...</span>
        </div>
      )}

      {error && (
        <div className="video-list-error" role="alert">
          <span className="error-icon">⚠️</span>
          <div className="error-content">
            <p className="error-message">{error}</p>
            <button 
              className="error-retry"
              onClick={() => {
                setError(null);
                // Trigger re-fetch by dependency change
                setProgressMap({});
              }}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="video-list-grid">
        {sortedVideos.map(video => {
          const progress = progressMap[video.id];
          const percent = progress?.percent || 0;
          
          return (
            <VideoCard
              key={video.id}
              video={video}
              progress={percent}
              completed={progress?.completed || percent === 100}
              onSelect={onSelect}
              thumbnail={video.thumbnail}
              duration={video.duration}
              category={video.category}
            />
          );
        })}
      </div>
    </div>
  );
};