const companionService = require('../services/companionService');
const { getLocalizedMessageFromRequest, getDefaultLanguage } = require('../utils/localization');

/**
 * Get companion for logged-in user
 * @route   GET /api/companion
 * @access  Private
 */
const getCompanion = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    console.log('getgetCompanion for user: ', req.user);
    const language = req.language || getDefaultLanguage();

    const companion = await companionService.getCompanion(userId, language);

    const message = getLocalizedMessageFromRequest('companion.get.success', req) || 'Companion retrieved successfully.';
    res.status(200).json({
      success: true,
      message,
      data: companion
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create companion for logged-in user
 * @route   POST /api/companion
 * @access  Private
 */
const createCompanion = async (req, res, next) => {
  try {
    

    const userId = req.user?.userId;

    console.log('createCompanion for user: ', req.user);

    const language = req.language || getDefaultLanguage();
    const { gender, name } = req.body || {};

    const companion = await companionService.createCompanion(userId, { gender, name }, language);

    const message = getLocalizedMessageFromRequest('companion.create.success', req) || 'Companion created successfully.';
    res.status(201).json({
      success: true,
      message,
      data: companion
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update companion for logged-in user
 * @route   PUT /api/companion
 * @access  Private
 */
const updateCompanion = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();

    const companion = await companionService.updateCompanion(userId, req.body, language);

    const message = getLocalizedMessageFromRequest('companion.update.success', req) || 'Companion updated successfully.';
    res.status(200).json({
      success: true,
      message,
      data: companion
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete companion for logged-in user
 * @route   DELETE /api/companion
 * @access  Private
 */
// TODO: delete this temporary API later.
const deleteCompanion = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();

    await companionService.deleteCompanion(userId, language);

    const message = getLocalizedMessageFromRequest('companion.delete.success', req) || 'Companion deleted successfully.';
    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanion,
  createCompanion,
  updateCompanion,
  deleteCompanion
};
