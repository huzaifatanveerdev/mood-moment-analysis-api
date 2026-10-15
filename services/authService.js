const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const { getLocalizedMessage, getDefaultLanguage } = require('../utils/localization');
const { AppError } = require('../utils/errors');
const { isValidEmail } = require('../utils/validators');
const { signTempToken, verifyTempToken, signToken } = require('../utils/jwt');
const sendGridService = require('./sendGridService');
const nodemailerService = require('./nodemailerService');

const OTP_EXPIRES_MINUTES = parseInt(process.env.OTP_EXPIRES_MINUTES, 10) || 2;
const OTP_LENGTH = 6;
const OTP_MAX_ATTEMPTS = 3;

/**
 * Generate 6-digit OTP
 * @returns {string}
 */
function generateOtp() {
  const digits = crypto.randomInt(0, 1e6).toString().padStart(OTP_LENGTH, '0');
  return digits.slice(-OTP_LENGTH);
}

/**
 * Request OTP for registration
 * @param {string} email - User email
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
async function requestOtp(email, language = getDefaultLanguage()) {
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!isValidEmail(trimmedEmail)) {
    const message = getLocalizedMessage('auth.requestOtp.error.invalidEmail', language);
    throw new AppError(message || 'Invalid email format.', 400);
  }

  const existingUser = await User.findOne({ email: trimmedEmail, isDeleted: { $ne: true } });
  if (existingUser) {
    const message = getLocalizedMessage('auth.requestOtp.error.userExists', language);
    throw new AppError(message || 'An account with this email already exists.', 400);
  }

  await OtpVerification.updateMany(
    { email: trimmedEmail, otpType: 'registration', isUsed: false },
    { $set: { isUsed: true } }
  );

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

  await OtpVerification.create({
    email: trimmedEmail,
    otp,
    otpType: 'registration',
    expiresAt,
    attempts: 0,
    maxAttempts: OTP_MAX_ATTEMPTS,
    isUsed: false
  });

  await nodemailerService.sendRegistrationOtp(trimmedEmail, otp, language);
  //await sendGridService.sendRegistrationOtp(trimmedEmail, otp, language);

  return { email: trimmedEmail };
}

/**
 * Verify OTP and return temporary token
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @param {string} language - Language code
 * @returns {Promise<{ tempToken: string }>}
 */
async function verifyOtp(email, otp, language = getDefaultLanguage()) {
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const trimmedOtp = typeof otp === 'string' ? otp.trim() : '';

  if (!trimmedEmail || !trimmedOtp) {
    const message = getLocalizedMessage('auth.verifyOtp.error.required', language);
    throw new AppError(message || 'Email and OTP are required.', 400);
  }

  const otpRecord = await OtpVerification.findOne({
    email: trimmedEmail,
    otpType: 'registration',
    isUsed: false
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    const message = getLocalizedMessage('auth.verifyOtp.error.invalidOrExpired', language);
    throw new AppError(message || 'Invalid or expired OTP.', 400);
  }

  if (otpRecord.isExpired()) {
    await OtpVerification.deleteOne({ _id: otpRecord._id });
    const message = getLocalizedMessage('auth.verifyOtp.error.invalidOrExpired', language);
    throw new AppError(message || 'Invalid or expired OTP.', 400);
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    await OtpVerification.deleteOne({ _id: otpRecord._id });
    const message = getLocalizedMessage('auth.verifyOtp.error.maxAttempts', language);
    throw new AppError(message || 'Maximum attempts exceeded. Please request a new OTP.', 400);
  }

  if (otpRecord.otp !== trimmedOtp) {
    const newAttempts = await otpRecord.incrementAttempts();
    if (newAttempts >= otpRecord.maxAttempts) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
    }
    const message = getLocalizedMessage('auth.verifyOtp.error.invalidOrExpired', language);
    throw new AppError(message || 'Invalid or expired OTP.', 400);
  }

  await OtpVerification.deleteOne({ _id: otpRecord._id });

  const tempToken = signTempToken({
    email: trimmedEmail,
    otpVerified: true,
    type: 'registration'
  });

  return { tempToken };
}

/**
 * Register user using temporary token
 * @param {string} tempToken - Temporary token from Authorization header
 * @param {object} body - { email, name, password, confirmPassword }
 * @param {string} language - Language code
 * @returns {Promise<{ token: string, user: object }>}
 */
async function registerUser(tempToken, body, language = getDefaultLanguage()) {
  if (!tempToken) {
    const message = getLocalizedMessage('auth.register.error.unauthorized', language);
    throw new AppError(message || 'Valid temporary token required.', 401);
  }

  let decoded;
  try {
    decoded = verifyTempToken(tempToken);
  } catch {
    const message = getLocalizedMessage('auth.register.error.invalidToken', language);
    throw new AppError(message || 'Invalid or expired token. Please complete OTP verification again.', 401);
  }

  if (decoded.type !== 'registration' || !decoded.otpVerified || !decoded.email) {
    const message = getLocalizedMessage('auth.register.error.invalidToken', language);
    throw new AppError(message || 'Invalid or expired token. Please complete OTP verification again.', 401);
  }

  const { email, name, password, confirmPassword } = body || {};
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const trimmedName = typeof name === 'string' ? name.trim() : '';

  if (!trimmedEmail || !trimmedName || !password || !confirmPassword) {
    const message = getLocalizedMessage('auth.register.error.fieldsRequired', language);
    throw new AppError(message || 'Email, name, password and confirmPassword are required.', 400);
  }

  if (trimmedEmail !== decoded.email) {
    const message = getLocalizedMessage('auth.register.error.invalidToken', language);
    throw new AppError(message || 'Invalid or expired token. Please complete OTP verification again.', 401);
  }

  if (password !== confirmPassword) {
    const message = getLocalizedMessage('auth.register.error.passwordMismatch', language);
    throw new AppError(message || 'Passwords do not match.', 400);
  }

  if (password.length < 8) {
    const message = getLocalizedMessage('auth.register.error.passwordTooShort', language);
    throw new AppError(message || 'Password must be at least 6 characters.', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email: trimmedEmail,
    name: trimmedName,
    password: hashedPassword,
    isDeleted: false,
    gender: User.DEFAULT_GENDER,
    language: language
  });

  const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
  await nodemailerService.sendWelcomeEmail(user.email, user.name, language);
  // await sendGridService.sendWelcomeEmail(user.email, user.name, language);

  const userObj = user.toObject();
  delete userObj.password;

  return {
    token,
    user: userObj
  };
}

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} language - Language code
 * @returns {Promise<{ token: string, user: object }>}
 */
async function login(email, password, language = getDefaultLanguage()) {
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!trimmedEmail) {
    const message = getLocalizedMessage('auth.login.error.emailRequired', language);
    throw new AppError(message || 'Email is required.', 400);
  }

  if (!isValidEmail(trimmedEmail)) {
    const message = getLocalizedMessage('auth.login.error.invalidEmail', language);
    throw new AppError(message || 'Invalid email format.', 400);
  }

  if (!password || typeof password !== 'string') {
    const message = getLocalizedMessage('auth.login.error.passwordRequired', language);
    throw new AppError(message || 'Password is required.', 400);
  }

  const user = await User.findOne({ email: trimmedEmail, isDeleted: { $ne: true } }).select('+password');
  if (!user) {
    const message = getLocalizedMessage('auth.login.error.emailNotFound', language);
    throw new AppError(message || 'No account exists with this email.', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const message = getLocalizedMessage('auth.login.error.incorrectPassword', language);
    throw new AppError(message || 'Password is incorrect.', 401);
  }

  const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
  const userObj = user.toObject();
  delete userObj.password;

  return {
    token,
    user: userObj
  };
}

/**
 * Request OTP for password reset. Only sends OTP if user exists; always returns same success message.
 * @param {string} email - User email
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
async function requestPasswordResetOtp(email, language = getDefaultLanguage()) {
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!isValidEmail(trimmedEmail)) {
    const message = getLocalizedMessage('auth.forgotPassword.error.invalidEmail', language);
    throw new AppError(message || 'Invalid email format.', 400);
  }

  const user = await User.findOne({ email: trimmedEmail, isDeleted: { $ne: true } });
  if (!user) {
    return { email: trimmedEmail };
  }

  await OtpVerification.updateMany(
    { email: trimmedEmail, otpType: 'reset-password', isUsed: false },
    { $set: { isUsed: true } }
  );

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

  await OtpVerification.create({
    email: trimmedEmail,
    otp,
    otpType: 'reset-password',
    expiresAt,
    attempts: 0,
    maxAttempts: OTP_MAX_ATTEMPTS,
    isUsed: false
  });

  await nodemailerService.sendPasswordResetOtp(trimmedEmail, otp, language);
  //await sendGridService.sendPasswordResetOtp(trimmedEmail, otp, language);

  return { email: trimmedEmail };
}

/**
 * Verify password reset OTP and return temporary token
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @param {string} language - Language code
 * @returns {Promise<{ tempToken: string }>}
 */
async function verifyPasswordResetOtp(email, otp, language = getDefaultLanguage()) {
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const trimmedOtp = typeof otp === 'string' ? otp.trim() : '';

  if (!trimmedEmail || !trimmedOtp) {
    const message = getLocalizedMessage('auth.verifyResetOtp.error.required', language);
    throw new AppError(message || 'Email and OTP are required.', 400);
  }

  const otpRecord = await OtpVerification.findOne({
    email: trimmedEmail,
    otpType: 'reset-password',
    isUsed: false
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    const message = getLocalizedMessage('auth.verifyResetOtp.error.invalidOrExpired', language);
    throw new AppError(message || 'Invalid or expired OTP.', 400);
  }

  if (otpRecord.isExpired()) {
    await OtpVerification.deleteOne({ _id: otpRecord._id });
    const message = getLocalizedMessage('auth.verifyResetOtp.error.invalidOrExpired', language);
    throw new AppError(message || 'Invalid or expired OTP.', 400);
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    await OtpVerification.deleteOne({ _id: otpRecord._id });
    const message = getLocalizedMessage('auth.verifyResetOtp.error.maxAttempts', language);
    throw new AppError(message || 'Maximum attempts exceeded. Please request a new OTP.', 400);
  }

  if (otpRecord.otp !== trimmedOtp) {
    const newAttempts = await otpRecord.incrementAttempts();
    if (newAttempts >= otpRecord.maxAttempts) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
    }
    const message = getLocalizedMessage('auth.verifyResetOtp.error.invalidOrExpired', language);
    throw new AppError(message || 'Invalid or expired OTP.', 400);
  }

  await OtpVerification.deleteOne({ _id: otpRecord._id });

  const tempToken = signTempToken({
    email: trimmedEmail,
    otpVerified: true,
    type: 'reset-password'
  });

  return { tempToken };
}

/**
 * Reset password using temporary token
 * @param {string} tempToken - Temporary token from Authorization header
 * @param {object} body - { newPassword, confirmPassword }
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
async function resetPassword(tempToken, body, language = getDefaultLanguage()) {
  if (!tempToken) {
    const message = getLocalizedMessage('auth.resetPassword.error.unauthorized', language);
    throw new AppError(message || 'Valid temporary token required.', 401);
  }

  let decoded;
  try {
    decoded = verifyTempToken(tempToken);
  } catch {
    const message = getLocalizedMessage('auth.resetPassword.error.invalidToken', language);
    throw new AppError(message || 'Invalid or expired token. Please complete OTP verification again.', 401);
  }

  if (decoded.type !== 'reset-password' || !decoded.otpVerified || !decoded.email) {
    const message = getLocalizedMessage('auth.resetPassword.error.invalidToken', language);
    throw new AppError(message || 'Invalid or expired token. Please complete OTP verification again.', 401);
  }

  const { newPassword, confirmPassword } = body || {};

  if (!newPassword || !confirmPassword) {
    const message = getLocalizedMessage('auth.resetPassword.error.fieldsRequired', language);
    throw new AppError(message || 'New password and confirm password are required.', 400);
  }

  if (newPassword !== confirmPassword) {
    const message = getLocalizedMessage('auth.resetPassword.error.passwordMismatch', language);
    throw new AppError(message || 'Passwords do not match.', 400);
  }

  if (newPassword.length < 6) {
    const message = getLocalizedMessage('auth.resetPassword.error.passwordTooShort', language);
    throw new AppError(message || 'Password must be at least 6 characters.', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.findOneAndUpdate(
    { email: decoded.email, isDeleted: { $ne: true } },
    { $set: { password: hashedPassword } }
  );

  return { email: decoded.email };
}

/**
 * Change password (JWT protected). Requires current password, new password and confirm password.
 * @param {string} userId - User _id from JWT
 * @param {object} body - { currentPassword, newPassword, confirmPassword }
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
async function changePassword(userId, body, language = getDefaultLanguage()) {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language);
    throw new AppError(message || 'Authentication required.', 401);
  }

  const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } }).select('+password');
  if (!user) {
    const message = getLocalizedMessage('user.profile.error.notFound', language);
    throw new AppError(message || 'User not found.', 404);
  }

  const { currentPassword, newPassword, confirmPassword } = body || {};

  if (!currentPassword || typeof currentPassword !== 'string') {
    const message = getLocalizedMessage('auth.changePassword.error.currentPasswordRequired', language);
    throw new AppError(message || 'Current password is required.', 400);
  }

  const currentMatch = await bcrypt.compare(currentPassword, user.password);
  if (!currentMatch) {
    const message = getLocalizedMessage('auth.changePassword.error.currentPasswordWrong', language);
    throw new AppError(message || 'Current password is incorrect.', 401);
  }

  if (!newPassword || !confirmPassword) {
    const message = getLocalizedMessage('auth.resetPassword.error.fieldsRequired', language);
    throw new AppError(message || 'New password and confirm password are required.', 400);
  }

  if (newPassword !== confirmPassword) {
    const message = getLocalizedMessage('auth.resetPassword.error.passwordMismatch', language);
    throw new AppError(message || 'Passwords do not match.', 400);
  }

  if (newPassword.length < 8) {
    const message = getLocalizedMessage('auth.resetPassword.error.passwordTooShort', language);
    throw new AppError(message || 'Password must be at least 6 characters.', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return {};
}

module.exports = {
  requestOtp,
  verifyOtp,
  registerUser,
  login,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
  changePassword
};
