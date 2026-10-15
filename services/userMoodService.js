const UserMood = require('../models/UserMood');
const Mood = require('../models/Mood');
const { AppError } = require('../utils/errors');
const { getLocalizedMessage, getDefaultLanguage } = require('../utils/localization');

/** Return only mood details for API response (no UserMood document fields). */
function toUserMoodResponse(populated) {
  if (!populated || !populated.moodId) return populated;
  return populated.moodId;
}

/**
 * Set or update user's current mood
 * @param {string} userId - User _id
 * @param {string} moodId - Mood _id
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
const setOrUpdateUserMood = async (userId, moodId, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }

  if (!moodId) {
    const message = getLocalizedMessage('userMood.error.moodIdRequired', language) || 'Mood ID is required.';
    throw new AppError(message, 400);
  }

  const mood = await Mood.findById(moodId);
  if (!mood) {
    const message = getLocalizedMessage('userMood.error.moodNotFound', language) || 'Mood not found.';
    throw new AppError(message, 404);
  }

  let userMood = await UserMood.findOne({ userId });
  if (userMood) {
    userMood.moodId = moodId;
    await userMood.save();
  } else {
    userMood = await UserMood.create({ userId, moodId });
  }

  const populated = await UserMood.findById(userMood._id)
    .populate('moodId', 'key label allowedTones')
    .lean();
  return toUserMoodResponse(populated);
};

/**
 * Get user's current mood with populated mood details
 * @param {string} userId - User _id
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
const getUserMood = async (userId, language = getDefaultLanguage()) => {
  if (!userId) {
    const message = getLocalizedMessage('user.profile.error.unauthorized', language) || 'Authentication required.';
    throw new AppError(message, 401);
  }

  const userMood = await UserMood.findOne({ userId })
    .populate('moodId', 'key label allowedTones')
    .lean();

  if (!userMood) {
    const message = getLocalizedMessage('userMood.error.notSet', language) || 'No mood selected.';
    throw new AppError(message, 404);
  }

  return toUserMoodResponse(userMood);
};

module.exports = {
  setOrUpdateUserMood,
  getUserMood
};
