const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.login = async (req, res) => {
  const { id, password } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({
    token,
    id: user.id,
    role: user.role
  });
};
