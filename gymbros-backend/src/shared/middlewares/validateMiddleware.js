export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const errorMessages = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: errorMessages,
    });
  }
};