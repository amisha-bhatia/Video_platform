import { useEffect, useState } from 'react';
import { VideoCard } from './VideoCard';
import { fetchProgress } from '../../api/video';

export const VideoList = ({ videos, onSelect, token }) => {
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    if (!videos.length || !token) return;

    const ids = videos.map(v => v.id);

    fetchProgress(ids, token)
      .then(data => {
        const map = {};
        data.forEach(p => {
          map[p.videoId] = p;
        });
        setProgressMap(map);
      })
      .catch(console.error);
  }, [videos, token]);

  return (
    <div className="list">
      {videos.map(video => {
        const progress = progressMap[video.id];
        const percent = progress?.completed
          ? 100
          : progress && progress.duration > 0
            ? Math.min(
                100,
                Math.round((progress.lastPosition / progress.duration) * 100)
              )
            : 0;

        return (
          <VideoCard
            key={video.id}
            video={video}
            progress={percent}
            completed={progress?.completed}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
};
