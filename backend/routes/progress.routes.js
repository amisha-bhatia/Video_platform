const express = require('express');
const validate = require('../middleware/validate.middleware');
const { progressSchema } = require('../validators/progress.schema');
const { requireAuth } = require('../middleware/auth.middleware');
const Progress = require('../models/progress.model');

const router = express.Router();

router.post('/', requireAuth, validate(progressSchema), async (req, res) => {
  await Progress.upsert({
    userId: req.user.id,
    ...req.body
  });

  res.json({ success: true });
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { videoIds } = req.query; // comma-separated string
    const ids = videoIds.split(',');
    const userId = req.user.id;

    const progressList = await Promise.all(
      ids.map(async (id) => {
        const progress = await Progress.getByUserAndVideo(userId, id);
        return { videoId: id, lastPosition: progress?.lastPosition || 0, duration: progress?.duration || 0 };
      })
    );

    res.json(progressList);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

