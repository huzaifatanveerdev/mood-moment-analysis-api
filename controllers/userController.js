const userService = require('../services/userService');
const { getLocalizedMessageFromRequest, getDefaultLanguage } = require('../utils/localization');

/**
 * Get current user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();

    const profile = await userService.getProfile(userId, language);

    const message = getLocalizedMessageFromRequest('user.profile.success', req) || 'User details retrieved successfully.';
    res.status(200).json({
      success: true,
      message,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile image
 * @route   POST /api/users/profile-image
 * @access  Private
 */
const uploadProfileImage = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();

    const result = await userService.uploadProfileImage(userId, req.file, language);

    const message = getLocalizedMessageFromRequest('user.profileImage.upload.success', req) || 'Profile image uploaded successfully.';
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
 * Get current user's profile image URL
 * @route   GET /api/users/profile-image
 * @access  Private
 */
const getProfileImage = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();

    const result = await userService.getProfileImage(userId, language);

    const message = getLocalizedMessageFromRequest('user.profileImage.get.success', req) || 'Profile image retrieved successfully.';
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
 * Update current user's profile (name, gender, pronouns, dateOfBirth). Partial updates allowed.
 * @route   PATCH /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();

    const profile = await userService.updateProfile(userId, req.body, language);

    const message = getLocalizedMessageFromRequest('user.profile.update.success', req) || 'Profile updated successfully.';
    res.status(200).json({
      success: true,
      message,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user's language. Accepts en, de, English or German (case insensitive).
 * @route   PATCH /api/users/language
 * @access  Private
 */
const updateLanguage = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();
    const { language: languageInput } = req.body;

    const result = await userService.updateLanguage(userId, languageInput, language);

    const message = getLocalizedMessageFromRequest('user.language.update.success', req) || 'Language updated successfully.';
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
 * Get current user's language
 * @route   GET /api/users/language
 * @access  Private
 */
const getLanguage = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();

    const result = await userService.getLanguage(userId, language);

    const message = getLocalizedMessageFromRequest('user.language.get.success', req) || 'Language retrieved successfully.';
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
 * Delete current user's account (soft delete)
 * @route   DELETE /api/users/account
 * @access  Private
 */
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();

    await userService.deleteAccount(userId, language);

    const message = getLocalizedMessageFromRequest('user.delete.success', req) || 'Account deleted successfully.';
    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getProfileImage,
  updateLanguage,
  getLanguage,
  deleteAccount
};
