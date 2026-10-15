const { getLocalizedMessageFromRequest, getDefaultLanguage } = require('../utils/localization');
const authService = require('../services/authService');
const companionService = require('../services/companionService');

/**
 * Request OTP for registration
 * @route   POST /api/auth/request-otp
 * @access  Public
 */
const requestOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const language = req.language || getDefaultLanguage();

    const result = await authService.requestOtp(email, language);

    const message = getLocalizedMessageFromRequest('auth.requestOtp.success', req) || 'OTP sent successfully. Check your email.';

    res.status(200).json({
      success: true,
      message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and get temporary token
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const language = req.language || getDefaultLanguage();

    const result = await authService.verifyOtp(email, otp, language);

    const message = getLocalizedMessageFromRequest('auth.verifyOtp.success', req) || 'OTP verified successfully.';

    res.status(200).json({
      success: true,
      message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register user (requires valid tempToken)
 * @route   POST /api/auth/register
 * @access  Public (requires Authorization: Bearer <tempToken>)
 */
const register = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tempToken = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader || null;
    const language = req.language || getDefaultLanguage();

    const result = await authService.registerUser(tempToken, req.body, language);

    const message = getLocalizedMessageFromRequest('auth.register.success', req) || 'Registration successful.';

    res.status(201).json({
      success: true,
      message,
      data: {
        ...result,
        isCompanionCustomized: false
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login with email and password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log(`login request for ${email}`);


    const language = req.language || getDefaultLanguage();

    const result = await authService.login(email, password, language);
    const isCompanionCustomized = await companionService.isCompanionCustomized(result?.user?._id);

    const message = getLocalizedMessageFromRequest('auth.login.success', req) || 'Login successful.';

    res.status(200).json({
      success: true,
      message,
      data: {
        ...result,
        isCompanionCustomized
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request OTP for password reset (forgot password)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const requestPasswordResetOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const language = req.language || getDefaultLanguage();

    const result = await authService.requestPasswordResetOtp(email, language);

    const message = getLocalizedMessageFromRequest('auth.forgotPassword.success', req) || 'If an account exists with this email, you will receive an OTP.';

    res.status(200).json({
      success: true,
      message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify password reset OTP and get temporary token
 * @route   POST /api/auth/verify-reset-otp
 * @access  Public
 */
const verifyPasswordResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const language = req.language || getDefaultLanguage();

    const result = await authService.verifyPasswordResetOtp(email, otp, language);

    const message = getLocalizedMessageFromRequest('auth.verifyResetOtp.success', req) || 'OTP verified successfully. You can now reset your password.';

    res.status(200).json({
      success: true,
      message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password (requires valid tempToken from verify-reset-otp)
 * @route   POST /api/auth/reset-password
 * @access  Public (requires Authorization: Bearer <tempToken>)
 */
const resetPassword = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tempToken = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader || null;
    const language = req.language || getDefaultLanguage();

    const result = await authService.resetPassword(tempToken, req.body, language);

    const message = getLocalizedMessageFromRequest('auth.resetPassword.success', req) || 'Password reset successful.';

    res.status(200).json({
      success: true,
      message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password (JWT protected)
 * @route   PATCH /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();

    await authService.changePassword(userId, req.body, language);

    const message = getLocalizedMessageFromRequest('auth.changePassword.success', req) || 'Password changed successfully.';
    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  register,
  login,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
  changePassword
};
