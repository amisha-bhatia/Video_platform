const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const videoRoutes = require('./routes/video.routes');
const progressRoutes = require('./routes/progress.routes');

const app = express();

const allowedOrigins = process.env.FRONTEND_URL.split(',');

app.use(cors({
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);

module.exports = app;
