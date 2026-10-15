const { verifyToken } = require('../utils/jwt');
const { getLocalizedMessage, getDefaultLanguage } = require('../utils/localization');
const { AppError } = require('../utils/errors');

/**
 * Protect routes with JWT. Attaches req.user = { userId, email }.
 */
const protect = (req, res, next) => {
  const language = req.language || getDefaultLanguage();
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language);
    return next(new AppError(message || 'Authentication required.', 401));
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded.userId || !decoded.email) {
      const message = getLocalizedMessage('user.profile.error.unauthorized', language);
      return next(new AppError(message || 'Authentication required.', 401));
    }
    req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    next();
  } catch {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language);
    next(new AppError(message || 'Authentication required.', 401));
  }
};

module.exports = {
  protect
};
