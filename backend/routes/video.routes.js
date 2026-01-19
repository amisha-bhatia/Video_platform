const express = require('express');
const multer = require('multer');
const { v4: uuid } = require('uuid');

const validate = require('../middleware/validate.middleware');
const { uploadVideoSchema } = require('../validators/video.schema');
const { requireAuth } = require('../middleware/auth.middleware');
const Video = require('../models/video.model');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.get('/', async (req, res) => {
  const auth = req.headers.authorization;
  let userId = null;

  if (auth) {
    try {
      const token = auth.split(' ')[1];
      userId = require('jsonwebtoken').verify(token, process.env.JWT_SECRET).id;
    } catch {}
  }

  res.json(await Video.getAll(userId));
});

router.post(
  '/',
  requireAuth,
  upload.single('video'),
  validate(uploadVideoSchema),
  async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const video = {
      id: uuid(),
      ...req.body,
      filename: req.file.filename,
      original_name: req.file.originalname
    };

    await Video.create(video);
    res.json(video);
  }
);

module.exports = router;
