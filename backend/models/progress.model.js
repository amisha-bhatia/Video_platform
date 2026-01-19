const pool = require('../config/db');

exports.upsert = async ({ userId, videoId, lastPosition, duration }) => {
  const completed = lastPosition / duration >= 0.9;

  await pool.query(
    `
    INSERT INTO video_progress (user_id, video_id, last_position, duration, completed)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, video_id)
    DO UPDATE SET
      last_position = EXCLUDED.last_position,
      duration = EXCLUDED.duration,
      completed = EXCLUDED.completed,
      updated_at = NOW()
    `,
    [userId, videoId, lastPosition, duration, completed]
  );
};
