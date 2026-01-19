const pool = require('../config/db'); // <- only once
const { v4: uuid } = require('uuid'); // if needed

exports.getAll = async (userId = null) => {
  if (!userId) {
    const { rows } = await pool.query(
      'SELECT * FROM videos ORDER BY created_at DESC'
    );
    return rows;
  }

  const { rows } = await pool.query(
    `
    SELECT v.*, p.last_position, p.duration, p.completed
    FROM videos v
    LEFT JOIN video_progress p
      ON v.id = p.video_id AND p.user_id = $1
    ORDER BY v.created_at DESC
    `,
    [userId]
  );

  return rows;
};

exports.create = async (video) => {
  await pool.query(
    `
    INSERT INTO videos (id, title, description, category, filename, original_name)
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    Object.values(video)
  );
};

exports.removeById = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM videos WHERE id = $1 RETURNING filename',
    [id]
  );

  return rows[0];
};
