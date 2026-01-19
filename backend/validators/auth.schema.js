const { z } = require('zod');

exports.loginSchema = z.object({
  id: z.string().min(3),
  password: z.string().min(6)
});
