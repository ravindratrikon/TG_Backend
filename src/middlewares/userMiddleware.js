const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { getUserById } = require('../services/user.service');
const logger = require('../config/logger');

const getUserInfoMiddleware = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Token not provided'));
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      if (err.name === 'JsonWebTokenError') {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token'));
      }
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Token expired'));
      }
      return next(err); // Pass other errors to the global error handler
    }

    const { id } = decoded;
    logger.warn({ id });
    try {
      const user = await getUserById(id);

      if (!user) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'User not found'));
      }

      req.user = user;

      next();
    } catch (error) {
      next(error); // Pass database errors to the global error handler
    }
  });
};

module.exports = getUserInfoMiddleware;
