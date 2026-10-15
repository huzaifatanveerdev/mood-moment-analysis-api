const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const TEMP_TOKEN_EXPIRES_MINUTES = parseInt(process.env.TEMP_TOKEN_EXPIRES_MINUTES, 10) || 2;

/**
 * Sign JWT token
 * @param {object} payload - Token payload
 * @param {string} expiresIn - JWT expiry (e.g. '7d')
 * @returns {string}
 */
function signToken(payload, expiresIn = JWT_EXPIRES_IN) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify JWT token
 * @param {string} token - JWT string
 * @returns {object} - Decoded payload
 */
function verifyToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Sign temporary token (for OTP flow)
 * @param {object} payload - { email, otpVerified, type }
 * @returns {string}
 */
function signTempToken(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  const expiresIn = `${TEMP_TOKEN_EXPIRES_MINUTES}m`;
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify temporary token
 * @param {string} token - Temp token string
 * @returns {object} - Decoded payload
 */
function verifyTempToken(token) {
  return verifyToken(token);
}

module.exports = {
  signToken,
  verifyToken,
  signTempToken,
  verifyTempToken
};
