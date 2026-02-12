const { v4: uuid } = require('uuid');
const Video = require('../models/video.model');

// GET /api/videos
exports.getAllVideos = async (req, res) => {
  try {
    const userId = req.user?.id || null; // optional, for future user-specific filtering
    const videos = Video.getAll(userId);
    console.log('Fetched videos:', videos);
    res.json(videos);
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
};

// POST /api/videos (upload)
exports.uploadVideo = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Missing video file' });
    }

    const video = {
      id: uuid(),
      title: req.body.title,
      description: req.body.description || '',
      category: req.body.category,
      filename: req.file.filename,
      original_name: req.file.originalname
    };

    Video.create(video);
    console.log('Uploaded video:', video);
    res.json(video);
  } catch (err) {
    console.error('Error uploading video:', err);
    res.status(500).json({ message: 'Failed to upload video' });
  }
};

// DELETE /api/videos/:id
exports.deleteVideo = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const deleted = Video.removeById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Video not found' });
    }

    console.log(`Deleted video with id ${req.params.id}`);
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting video:', err);
    res.status(500).json({ message: 'Failed to delete video' });
  }
};
