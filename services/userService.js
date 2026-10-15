const User = require('../models/User');
const { AppError } = require('../utils/errors');
const { getLocalizedMessage, getDefaultLanguage } = require('../utils/localization');
const { uploadImage, deleteImage, isConfigured } = require('../utils/cloudinary');

/**
 * Get user profile by id (all fields except password)
 * @param {string} userId - User _id
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
const getProfile = async (userId, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }

  const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } }).lean();
  if (!user) {
    const message = getLocalizedMessage('user.profile.error.notFound', language) || 'User not found.';
    throw new AppError(message, 404);
  }

  delete user.password;
  return user;
};

/**
 * Soft-delete user account (set isDeleted to true)
 * @param {string} userId - User _id
 * @param {string} language - Language code
 * @returns {Promise<void>}
 */
const deleteAccount = async (userId, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }

  const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } });
  if (!user) {
    const message = getLocalizedMessage('user.delete.error.notFound', language) || 'User not found.';
    throw new AppError(message, 404);
  }

  if (user.profileImagePublicId && isConfigured()) {
    await deleteImage(user.profileImagePublicId);
  }

  user.isDeleted = true;
  user.email = user.email + user._id.toString();
  await user.save();
};

/**
 * Upload profile image (replaces existing if any)
 * @param {string} userId - User _id
 * @param {object} file - Multer file { buffer, mimetype }
 * @param {string} language - Language code
 * @returns {Promise<{ profileImageUrl: string }>}
 */
const uploadProfileImage = async (userId, file, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }
  if (!isConfigured()) {
    const message = getLocalizedMessage('user.profileImage.error.cloudinaryNotConfigured', language) || 'Image upload is not configured.';
    throw new AppError(message, 503);
  }
  if (!file || !file.buffer) {
    const message = getLocalizedMessage('user.profileImage.error.noFile', language) || 'No image file provided.';
    throw new AppError(message, 400);
  }

  const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } });
  if (!user) {
    const message = getLocalizedMessage('user.profile.error.notFound', language) || 'User not found.';
    throw new AppError(message, 404);
  }

  if (user.profileImagePublicId) {
    await deleteImage(user.profileImagePublicId);
  }

  const { url, publicId } = await uploadImage(file.buffer);
  user.profileImageUrl = url;
  user.profileImagePublicId = publicId;
  await user.save();

  return { profileImageUrl: url };
};

/**
 * Get current user's profile image URL
 * @param {string} userId - User _id
 * @param {string} language - Language code
 * @returns {Promise<{ profileImageUrl: string }>}
 */
const getProfileImage = async (userId, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }

  const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } }).select('profileImageUrl').lean();
  if (!user) {
    const message = getLocalizedMessage('user.profile.error.notFound', language) || 'User not found.';
    throw new AppError(message, 404);
  }
  if (!user.profileImageUrl) {
    const message = getLocalizedMessage('user.profileImage.error.notFound', language) || 'No profile image found.';
    throw new AppError(message, 404);
  }

  return { profileImageUrl: user.profileImageUrl };
};

const LANGUAGE_MAP = { en: 'en', english: 'en', de: 'de', german: 'de' };

/**
 * Update user profile (name, gender, pronouns, dateOfBirth). Only provided fields are updated.
 * @param {string} userId - User _id
 * @param {object} body - { name?, gender?, pronouns?, dateOfBirth? }
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
const updateProfile = async (userId, body, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }

  const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } });
  if (!user) {
    const message = getLocalizedMessage('user.profile.error.notFound', language) || 'User not found.';
    throw new AppError(message, 404);
  }

  if (body.name !== undefined) {
    const trimmed = typeof body.name === 'string' ? body.name.trim() : '';
    if (!trimmed) {
      const message = getLocalizedMessage('user.profile.update.error.nameRequired', language) || 'Name cannot be empty.';
      throw new AppError(message, 400);
    }
    user.name = trimmed;
  }
  if (body.gender !== undefined) {
    const val = typeof body.gender === 'string' ? body.gender.trim().toLowerCase() : '';
    if (val && !User.GENDER_ENUM.includes(val)) {
      const message = getLocalizedMessage('user.profile.update.error.invalidGender', language) || 'Invalid gender.';
      throw new AppError(message, 400);
    }
    user.gender = val || null;
  }
  if (body.pronouns !== undefined) {
    user.pronouns = typeof body.pronouns === 'string' ? body.pronouns.trim() || null : null;
  }
  if (body.dateOfBirth !== undefined) {
    if (body.dateOfBirth === null || body.dateOfBirth === '') {
      user.dateOfBirth = null;
    } else {
      const d = new Date(body.dateOfBirth);
      if (Number.isNaN(d.getTime())) {
        const message = getLocalizedMessage('user.profile.update.error.invalidDate', language) || 'Invalid date of birth.';
        throw new AppError(message, 400);
      }
      user.dateOfBirth = d;
    }
  }

  await user.save();
  const out = user.toObject();
  delete out.password;
  return out;
};

/**
 * Update user language. Accepts 'en'|'de'|'English'|'German' (case insensitive). Saves as 'en' or 'de'.
 * @param {string} userId - User _id
 * @param {string} languageInput - User-provided language
 * @param {string} language - Request language for error messages
 * @returns {Promise<{ language: string }>}
 */
const updateLanguage = async (userId, languageInput, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }

  const normalized = typeof languageInput === 'string' ? languageInput.trim().toLowerCase() : '';
  const code = LANGUAGE_MAP[normalized];
  if (!code) {
    const message = getLocalizedMessage('user.language.error.invalid', language) || 'Invalid language. Use en, de, English or German.';
    throw new AppError(message, 400);
  }

  const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } });
  if (!user) {
    const message = getLocalizedMessage('user.profile.error.notFound', language) || 'User not found.';
    throw new AppError(message, 404);
  }

  user.language = code;
  await user.save();
  return { language: code };
};

/**
 * Get current user's language
 * @param {string} userId - User _id
 * @param {string} language - Language code
 * @returns {Promise<{ language: string }>}
 */
const getLanguage = async (userId, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }

  const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } }).select('language').lean();
  if (!user) {
    const message = getLocalizedMessage('user.profile.error.notFound', language) || 'User not found.';
    throw new AppError(message, 404);
  }

  return { language: user.language || getDefaultLanguage() };
};

module.exports = {
  getProfile,
  deleteAccount,
  uploadProfileImage,
  getProfileImage,
  updateProfile,
  updateLanguage,
  getLanguage
};
