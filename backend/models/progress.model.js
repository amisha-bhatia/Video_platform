const pool = require('../config/db');

exports.upsert = async ({ userId, videoId, lastPosition = 0, duration = 0 }) => {
  lastPosition = Math.min(lastPosition, duration);
  const completed = duration > 0 ? lastPosition / duration >= 0.9 : false;

  const { rows } = await pool.query(
    `
    INSERT INTO video_progress (user_id, video_id, last_position, duration, completed, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (user_id, video_id)
    DO UPDATE SET
      last_position = EXCLUDED.last_position,
      duration = EXCLUDED.duration,
      completed = EXCLUDED.completed,
      updated_at = NOW()
    RETURNING *
    `,
    [userId, videoId, lastPosition, duration, completed]
  );

  return rows[0];
};

// ✅ ADD THIS — REQUIRED BY YOUR ROUTES
exports.getByUserAndVideo = async (userId, videoId) => {
  const { rows } = await pool.query(
    `
    SELECT
      video_id AS "videoId",
      last_position AS "lastPosition",
      duration,
      completed
    FROM video_progress
    WHERE user_id = $1 AND video_id = $2
    LIMIT 1
    `,
    [userId, videoId]
  );

  return rows[0] || null;
};
