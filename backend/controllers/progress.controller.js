const Progress = require('../models/progress.model');

exports.saveProgress = async (req, res) => {
  await Progress.upsert({
    userId: req.user.id,
    videoId: req.body.videoId,
    lastPosition: req.body.lastPosition,
    duration: req.body.duration
  });

  res.json({ success: true });
};
