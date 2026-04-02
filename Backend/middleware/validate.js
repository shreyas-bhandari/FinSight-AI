const Joi = require('joi');

// General validation middleware
const validate = (schema) => (req, res, next) => {
  const validSchema = ['body', 'query', 'params'].reduce((acc, key) => {
    if (schema[key]) {
      acc[key] = schema[key];
    }
    return acc;
  }, {});

  const object = ['body', 'query', 'params'].reduce((acc, key) => {
    if (schema[key]) {
      acc[key] = req[key];
    }
    return acc;
  }, {});

  const { value, error } = Joi.object(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return res.status(400).json({ success: false, message: errorMessage });
  }

  Object.assign(req, value);
  return next();
};

module.exports = validate;
