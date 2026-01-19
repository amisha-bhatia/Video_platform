const { z } = require('zod');

exports.progressSchema = z.object({
  videoId: z.string().uuid(),
  lastPosition: z.number().int().nonnegative(),
  duration: z.number().int().positive()
});
