import { validationResult } from "npm:express-validator";
import { AppError } from './errorHandler.js';

const formatValidationErrors = (errors) => {
  return errors.array().reduce((acc, error) => {
    const field = error.path;
    if (!acc[field]) {
      acc[field] = [];
    }
    acc[field].push(error.msg);
    return acc;
  }, {});
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = formatValidationErrors(errors);
    const errorMessage = Object.entries(formattedErrors)
      .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
      .join('; ');
    
    return next(new AppError(errorMessage, 400));
  }
  next();
};

export default validate;
