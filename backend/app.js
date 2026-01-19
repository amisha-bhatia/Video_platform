const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const videoRoutes = require('./routes/video.routes');
const progressRoutes = require('./routes/progress.routes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);

module.exports = app;
