export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Convert operational errors
  let error = err;
  if (!(err instanceof AppError)) {
    let statusCode = 500;
    let message = 'Internal Server Error';
    
    // Handle common error types
    switch (err.name) {
      case 'ValidationError':
        statusCode = 400;
        message = err.message;
        break;
      case 'NotFoundError':
        statusCode = 404;
        message = err.message;
        break;
      case 'SyntaxError':
        if (err.type === 'entity.parse.failed') {
          statusCode = 400;
          message = 'Invalid JSON data';
        }
        break;
      case 'FileError':
        statusCode = 500;
        message = 'File operation failed';
        break;
    }
    
    error = new AppError(message, statusCode);
  }

  // Send error response
  const response = {
    success: false,
    status: error.status || 'error',
    message: error.message
  };

  // Add stack trace in development
  if (Deno.env.get("NODE_ENV") === 'development') {
    response.stack = error.stack;
  }

  res.status(error.statusCode || 500).json(response);
};
