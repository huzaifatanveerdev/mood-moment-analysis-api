const userMoodService = require('../services/userMoodService');
const { getLocalizedMessageFromRequest, getDefaultLanguage } = require('../utils/localization');

/**
 * Set or update current user's mood
 * @route   POST /api/user-mood
 * @access  Private
 */
const setUserMood = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();
    const { moodId } = req.body;

    const userMood = await userMoodService.setOrUpdateUserMood(userId, moodId, language);

    const message = getLocalizedMessageFromRequest('userMood.set.success', req) || 'Mood updated successfully.';
    res.status(200).json({
      success: true,
      message,
      data: userMood
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's selected mood
 * @route   GET /api/user-mood
 * @access  Private
 */
const getUserMood = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();

    const userMood = await userMoodService.getUserMood(userId, language);

    const message = getLocalizedMessageFromRequest('userMood.get.success', req) || 'Mood retrieved successfully.';
    res.status(200).json({
      success: true,
      message,
      data: userMood
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setUserMood,
  getUserMood
};
