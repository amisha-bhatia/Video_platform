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

module.exports = router;
