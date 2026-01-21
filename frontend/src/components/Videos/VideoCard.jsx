export const VideoCard = ({ video, onSelect, progress, completed }) => (
  <div className="list-item" onClick={() => onSelect(video)}>
    <div className="title-row">
      <span>{video.title}</span>
      {completed && <span className="badge">Completed</span>}
    </div>

    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${progress}%` }}
      />
    </div>

    <small>{progress}% watched</small>
  </div>
);
