const { z } = require('zod');

exports.uploadVideoSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(['diecast', 'kakou', 'kumitate', 'kaihatsu'])
});
