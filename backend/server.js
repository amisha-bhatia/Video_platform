require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');



const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ================= FILE STORAGE ================= */
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
const upload = multer({ dest: 'uploads/' });

//swagger setup
const swaggerDocument = YAML.load('./swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* ================= AUTH HELPERS ================= */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

/* ================= LOGIN ================= */
app.post('/api/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (!rows.length) return res.status(401).json({ message: 'Invalid ID' });

    const user = rows[0];
    const ok = bcrypt.compareSync(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({ token, id: user.id, role: user.role });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ================= VIDEOS ================= */

// GET ALL VIDEOS (public)
app.get('/api/videos', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM videos ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPLOAD VIDEO (ADMIN only)
app.post('/api/videos', verifyToken, upload.single('video'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { title, description, category } = req.body;
    if (!req.file || !title || !category) return res.status(400).json({ message: 'Missing fields' });

    const newVideo = {
      id: uuid(),
      title,
      description: description || '',
      category,
      filename: req.file.filename,
      original_name: req.file.originalname
    };

    await pool.query(
      `INSERT INTO videos (id, title, description, category, filename, original_name)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      Object.values(newVideo)
    );

    res.json(newVideo);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// DELETE VIDEO (ADMIN only)
app.delete('/api/videos/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { rows } = await pool.query('SELECT filename FROM videos WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Video not found' });

    const filePath = path.join(__dirname, 'uploads', rows[0].filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM videos WHERE id = $1', [req.params.id]);

    res.sendStatus(204);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed' });
  }
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
