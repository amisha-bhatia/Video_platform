const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT ||4000;

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: 'https://elegant-kashata-84e99a.netlify.app'
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ================= FILE SETUP ================= */
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('videos.json')) fs.writeFileSync('videos.json', '[]');
if (!fs.existsSync('users.json')) fs.writeFileSync('users.json', '[]');

/* ================= MULTER ================= */
const upload = multer({ dest: 'uploads/' });

/* ================= HELPERS ================= */
const readVideos = () => JSON.parse(fs.readFileSync('videos.json'));
const saveVideos = (videos) => fs.writeFileSync('videos.json', JSON.stringify(videos, null, 2));
const readUsers = () => JSON.parse(fs.readFileSync('users.json'));

/* ================= LOGIN ================= */
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  const users = readUsers();

  const user = users.find(u => u.id === id);
  if (!user) return res.status(401).json({ message: 'Invalid ID' });

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid password' });

  res.json({ id: user.id, role: user.role });
});

/* ================= VIDEOS ================= */

// GET all videos
app.get('/api/videos', (req, res) => {
  res.json(readVideos());
});

// UPLOAD video (admin only)
app.post('/api/videos', upload.single('video'), (req, res) => {
  const role = req.headers['x-role'];
  if (role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  if (!req.file || !req.body.title || !req.body.category) {
    return res.status(400).json({ message: 'Missing file, title, or category' });
  }

  const videos = readVideos();

  const newVideo = {
    id: uuid(),
    title: req.body.title,
    description: req.body.description || '',
    category: req.body.category,
    filename: req.file.filename,
    originalName: req.file.originalname,
    createdAt: new Date().toISOString()
  };

  videos.push(newVideo);
  saveVideos(videos);

  res.json(newVideo);
});

// DELETE video (admin only)
app.delete('/api/videos/:id', (req, res) => {
  const role = req.headers['x-role'];
  if (role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const videos = readVideos();
  const index = videos.findIndex(v => v.id === req.params.id);

  if (index === -1) return res.status(404).json({ message: 'Video not found' });

  const video = videos[index];
  const filePath = path.join(__dirname, 'uploads', video.filename);

  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  videos.splice(index, 1);
  saveVideos(videos);

  res.sendStatus(204);
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
