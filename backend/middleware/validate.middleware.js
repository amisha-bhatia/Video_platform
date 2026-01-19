module.exports = (schema, property = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[property]);

  if (!result.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: result.error.issues.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  req[property] = result.data; // sanitized
  next();
};