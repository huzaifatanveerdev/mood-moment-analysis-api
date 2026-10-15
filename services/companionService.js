const Companion = require('../models/Companion');
const { AppError } = require('../utils/errors');
const { getLocalizedMessage, getDefaultLanguage } = require('../utils/localization');
const { COMPANION_GENDER_ENUM } = require('../models/Companion');
const companionImages = require('../data/companion-image.json');

/**
 * Create companion for user
 * @param {string} userId - User _id
 * @param {object} data - { gender, name? }
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
const createCompanion = async (userId, data, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }

  const { name, gender } = data || {};

  if (!gender || typeof gender !== 'string' || !gender.trim()) {
    const message = getLocalizedMessage('companion.error.genderRequired', language) || 'Gender is required.';
    throw new AppError(message, 400);
  }

  const genderLower = gender.trim().toLowerCase();
  if (!COMPANION_GENDER_ENUM.includes(genderLower)) {
    const message = getLocalizedMessage('companion.error.invalidGender', language) || 'Invalid gender. Use male, female, or neutral.';
    throw new AppError(message, 400);
  }

  const imageUrl = companionImages[genderLower];
  if (!imageUrl) {
    const message = getLocalizedMessage('companion.error.invalidGender', language) || 'Invalid gender. Use male or female.';
    throw new AppError(message, 400);
  }

  const existing = await Companion.findOne({ userId });
  if (existing) {
    const message = getLocalizedMessage('companion.error.alreadyExists', language) || 'Companion already exists for this user.';
    throw new AppError(message, 400);
  }

  const companion = await Companion.create({
    userId,
    imageUrl,
    imagePublicId: null,
    gender: genderLower,
    ...(typeof name === 'string' && name.trim() ? { name: name.trim() } : {})
  });

  return companion.toObject();
};

/**
 * Get companion for user
 * @param {string} userId - User _id
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
const getCompanion = async (userId, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }

  const companion = await Companion.findOne({ userId }).lean();
  if (!companion) {
    const message = getLocalizedMessage('companion.error.notFound', language) || 'Companion not found.';
    throw new AppError(message, 404);
  }

  return companion;
};

/**
 * Update companion for user
 * @param {string} userId - User _id
 * @param {object} updates - { name?, gender? }
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
const updateCompanion = async (userId, updates, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }

  const companion = await Companion.findOne({ userId });
  if (!companion) {
    const message = getLocalizedMessage('companion.error.notFound', language) || 'Companion not found.';
    throw new AppError(message, 404);
  }

  const { name, gender } = updates || {};

  if (name !== undefined) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      const message = getLocalizedMessage('companion.error.nameRequired', language) || 'Name is required.';
      throw new AppError(message, 400);
    }
    companion.name = name.trim();
  }

  if (gender !== undefined) {
    if (!gender || typeof gender !== 'string' || !gender.trim()) {
      const message = getLocalizedMessage('companion.error.genderRequired', language) || 'Gender is required.';
      throw new AppError(message, 400);
    }
    const genderLower = gender.trim().toLowerCase();
    if (!COMPANION_GENDER_ENUM.includes(genderLower)) {
      const message = getLocalizedMessage('companion.error.invalidGender', language) || 'Invalid gender. Use male, female, or neutral.';
      throw new AppError(message, 400);
    }
    const imageUrl = companionImages[genderLower];
    if (!imageUrl) {
      const message = getLocalizedMessage('companion.error.invalidGender', language) || 'Invalid gender. Use male or female.';
      throw new AppError(message, 400);
    }
    companion.gender = genderLower;
    companion.imageUrl = imageUrl;
  }

  await companion.save();
  return companion.toObject();
};

/**
 * Check whether companion is customized for user
 * @param {string} userId - User _id
 * @returns {Promise<boolean>}
 */
const isCompanionCustomized = async (userId) => {
  if (!userId) return false;

  const companion = await Companion.findOne({ userId }).select('_id').lean();
  return Boolean(companion);
};

/**
 * Delete companion for user
 * @param {string} userId - User _id
 * @param {string} language - Language code
 * @returns {Promise<void>}
 */
const deleteCompanion = async (userId, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }

  const companion = await Companion.findOne({ userId });
  if (!companion) {
    const message = getLocalizedMessage('companion.error.notFound', language) || 'Companion not found.';
    throw new AppError(message, 404);
  }

  await companion.deleteOne();
};

module.exports = {
  getCompanion,
  createCompanion,
  updateCompanion,
  isCompanionCustomized,
  deleteCompanion
};
