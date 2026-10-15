const { resolveLanguage } = require('../utils/localization');

/**
 * Language detection middleware
 * Extracts language from Accept-Language header and attaches to req.language
 */
const languageMiddleware = (req, res, next) => {
  const acceptLanguage = req.headers['accept-language'] || '';
  req.language = resolveLanguage(acceptLanguage);
  next();
};

module.exports = languageMiddleware;
