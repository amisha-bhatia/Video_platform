const { v4: uuid } = require('uuid');
const Video = require('../models/video.model');

exports.getAllVideos = async (req, res) => {
  const userId = req.user?.id || null;
  const videos = await Video.getAll(userId);
  res.json(videos);
};

exports.uploadVideo = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
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

  await Video.create(video);
  res.json(video);
};

exports.deleteVideo = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const deleted = await Video.removeById(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Video not found' });
  }

  res.sendStatus(204);
};
