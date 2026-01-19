const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const validate = require('../middleware/validate.middleware');
const { loginSchema } = require('../validators/auth.schema');
const User = require('../models/user.model');

const router = express.Router();

router.post('/login', validate(loginSchema), async (req, res) => {
  const { id, password } = req.body;

  const user = await User.findById(id);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token, id: user.id, role: user.role });
});

module.exports = router;
