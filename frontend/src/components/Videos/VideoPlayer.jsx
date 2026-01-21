import { useRef, useEffect } from 'react';
import { saveProgress, fetchProgress } from '../../api/video';

const BASE_URL = 'http://localhost:4000';

export const VideoPlayer = ({ video, token }) => {
  const videoRef = useRef(null);
  const lastSavedRef = useRef(0);
  const hasSeekedRef = useRef(false);

  // ▶ Resume from last position
  useEffect(() => {
    if (!token || !video?.id) return;

    fetchProgress([video.id], token)
      .then(([progress]) => {
        if (
          progress &&
          progress.lastPosition > 0 &&
          videoRef.current &&
          !hasSeekedRef.current
        ) {
          videoRef.current.currentTime = progress.lastPosition;
          hasSeekedRef.current = true;
        }
      })
      .catch(console.error);
  }, [video, token]);

  // 💾 Save progress every 5 seconds
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleTimeUpdate = () => {
      if (!videoEl.duration || isNaN(videoEl.duration)) return;
      if (videoEl.currentTime - lastSavedRef.current < 5) return;

      lastSavedRef.current = videoEl.currentTime;

      saveProgress({
        token,
        videoId: video.id,
        lastPosition: Math.floor(videoEl.currentTime),
        duration: Math.floor(videoEl.duration),
      });
    };

    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    return () =>
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
  }, [video, token]);

  useEffect(() => {
  const videoEl = videoRef.current;
  if (!videoEl) return;

  const handleEnded = () => {
    saveProgress({
      token,
      videoId: video.id,
      lastPosition: Math.floor(videoEl.duration),
      duration: Math.floor(videoEl.duration),
    });
  };

  videoEl.addEventListener('ended', handleEnded);
  return () => videoEl.removeEventListener('ended', handleEnded);
  }, [video, token]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      src={`${BASE_URL}/uploads/${video.filename}`}
      style={{ width: '100%' }}
    />
  );
};
