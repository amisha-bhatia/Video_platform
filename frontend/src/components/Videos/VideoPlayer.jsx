import { useRef, useEffect, useCallback, useState } from 'react';
import { saveProgress, fetchProgress } from '../../api/video';
import '../Styles/VideoPlayer.css';

const BASE_URL =  'http://localhost:4000';
const SAVE_INTERVAL = 10; // seconds
const DEBOUNCE_DELAY = 2000; // ms

export const VideoPlayer = ({ video, token, onComplete, autoPlay = true }) => {
  const videoRef = useRef(null);
  const lastSavedRef = useRef(0);
  const hasSeekedRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Load saved progress
  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      if (!token || !video?.id) return;

      try {
        setIsLoading(true);
        const [progress] = await fetchProgress([video.id], token);
        
        if (!isMounted) return;

        if (progress?.lastPosition > 0 && videoRef.current && !hasSeekedRef.current) {
          // Seek to last position
          videoRef.current.currentTime = progress.lastPosition;
          hasSeekedRef.current = true;
          
          // Check if video was already completed
          if (progress.completed) {
            setCurrentTime(progress.duration);
            setDuration(progress.duration);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load your progress');
        console.error('Progress load error:', err);
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
  }, [video, token]);

  // Debounced save function
  const debouncedSave = useCallback((position, videoDuration) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const isCompleted = position >= videoDuration - 1; // Within 1 second of end
        
        await saveProgress({
          token,
          videoId: video.id,
          lastPosition: Math.floor(position),
          duration: Math.floor(videoDuration),
          completed: isCompleted
        });

        if (isCompleted && onComplete) {
          onComplete(video.id);
        }

        lastSavedRef.current = position;
      } catch (err) {
        console.error('Progress save failed:', err);
        // Don't show error to user to avoid disruption
      }
    }, DEBOUNCE_DELAY);
  }, [token, video.id, onComplete]);

  // Handle time updates
  const handleTimeUpdate = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl?.duration || isNaN(videoEl.duration)) return;

    const currentTime = videoEl.currentTime;
    const videoDuration = videoEl.duration;

    setCurrentTime(currentTime);
    setDuration(videoDuration);

    // Save progress at intervals
    if (Math.abs(currentTime - lastSavedRef.current) >= SAVE_INTERVAL) {
      debouncedSave(currentTime, videoDuration);
    }
  }, [debouncedSave]);

  // Handle video end
  const handleEnded = useCallback(async () => {
    const videoEl = videoRef.current;
    if (!videoEl?.duration) return;

    const videoDuration = videoEl.duration;
    
    try {
      await saveProgress({
        token,
        videoId: video.id,
        lastPosition: Math.floor(videoDuration),
        duration: Math.floor(videoDuration),
        completed: true
      });

      setCurrentTime(videoDuration);
      
      if (onComplete) {
        onComplete(video.id);
      }
    } catch (err) {
      console.error('Failed to save completion:', err);
    }
  }, [token, video.id, onComplete]);

  // Handle play/pause
  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  // Handle metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    const videoEl = videoRef.current;
    if (videoEl?.duration) {
      setDuration(videoEl.duration);
    }
  }, []);

  // Handle errors
  const handleError = useCallback((e) => {
    const videoEl = videoRef.current;
    let errorMessage = 'Failed to load video';
    
    if (videoEl?.error) {
      switch (videoEl.error.code) {
        case 1:
          errorMessage = 'Video loading aborted';
          break;
        case 2:
          errorMessage = 'Network error while loading video';
          break;
        case 3:
          errorMessage = 'Video format not supported';
          break;
        case 4:
          errorMessage = 'Video not found';
          break;
        default:
          errorMessage = 'Unknown video error';
      }
    }
    
    setError(errorMessage);
    setIsLoading(false);
  }, []);

  // Handle can play
  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      // Don't handle if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          videoEl.paused ? videoEl.play() : videoEl.pause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoEl.currentTime += 10;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoEl.currentTime -= 10;
          break;
        case 'ArrowUp':
          e.preventDefault();
          videoEl.volume = Math.min(1, videoEl.volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          videoEl.volume = Math.max(0, videoEl.volume - 0.1);
          break;
        case 'f':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            videoEl.requestFullscreen();
          }
          break;
        case 'm':
          e.preventDefault();
          videoEl.muted = !videoEl.muted;
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          const percent = parseInt(e.key) / 10;
          videoEl.currentTime = videoEl.duration * percent;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!video) {
    return (
      <div className="video-player-error">
        <span className="error-icon">🎬</span>
        <p>No video selected</p>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      <div className="video-player-wrapper">
        {isLoading && (
          <div className="video-player-loading">
            <div className="loading-spinner" />
            <span>Loading video...</span>
          </div>
        )}

        {error && (
          <div className="video-player-error" role="alert">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <p className="error-message">{error}</p>
              <button 
                className="error-retry"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  videoRef.current?.load();
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="video-player"
          controls
          autoPlay={autoPlay}
          src={`${BASE_URL}/uploads/${video.filename}`}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={handlePlay}
          onPause={handlePause}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleError}
          onCanPlay={handleCanPlay}
          preload="metadata"
          crossOrigin="anonymous"
        >
          <track
            kind="captions"
            src={`${BASE_URL}/uploads/${video.filename}.vtt`}
            label="English"
            srcLang="en"
            default
          />
          Your browser does not support the video tag.
        </video>

        <div className="video-player-overlay">
          <div className="video-progress-indicator">
            <div 
              className="progress-bar"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          
          <div className="video-controls-hint">
            <span className="hint-item">␣ Play/Pause</span>
            <span className="hint-item">←/→ Skip 10s</span>
            <span className="hint-item">↑/↓ Volume</span>
            <span className="hint-item">F Fullscreen</span>
            <span className="hint-item">M Mute</span>
            <span className="hint-item">0-9 Skip %</span>
          </div>
        </div>
      </div>

      <div className="video-info">
        <h2 className="video-title">{video.title}</h2>
        {video.description && (
          <p className="video-description">{video.description}</p>
        )}
        <div className="video-metadata">
          <span className="metadata-item">
            <span className="metadata-icon">📁</span>
            {video.category}
          </span>
          <span className="metadata-item">
            <span className="metadata-icon">⏱️</span>
            {formatDuration(duration)}
          </span>
          {currentTime > 0 && (
            <span className="metadata-item">
              <span className="metadata-icon">📍</span>
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format duration
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hours = Math.floor(mins / 60);
  
  if (hours > 0) {
    return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};