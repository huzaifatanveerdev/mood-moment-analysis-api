const moodService = require('../services/moodService');
const { getLocalizedMessageFromRequest, getDefaultLanguage } = require('../utils/localization');

/**
 * Get all moods
 * @route   GET /api/moods
 * @access  Private
 */
const getMoods = async (req, res, next) => {
  try {
    const moods = await moodService.getAllMoods();
    const message = getLocalizedMessageFromRequest('mood.get.success', req) || 'Moods retrieved successfully.';
    res.status(200).json({
      success: true,
      message,
      data: moods
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get mood scale rows (collection mood_scale)
 * @route   GET /api/moods/mood-scale-all
 * @access  Private (Admin)
 */
const getAllMoodScale = async (req, res, next) => {
  try {
    const rows = await moodService.getAllMoodScale();
    const message = getLocalizedMessageFromRequest('mood.scale.get.success', req) || 'Mood scale retrieved successfully.';
    res.status(200).json({
      success: true,
      message,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * All mood scale rows: label, prompt, feeling, style, responseHint for req.language (Accept-Language).
 * For full bilingual fields (labelEn, labelDe, feelingEn, …) use GET /api/moods/mood-scale-all (admin).
 * @route   GET /api/moods/mood-scale
 * @access  Private
 */
const getMoodScale = async (req, res, next) => {
  try {
    const language = req.language || getDefaultLanguage();
    const data = await moodService.getAllMoodScaleLocalized(language);
    const message =
      getLocalizedMessageFromRequest('mood.scale.item.get.success', req) ||
      'Mood scale retrieved successfully.';
    res.status(200).json({
      success: true,
      message,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a single mood (admin only)
 * @route   POST /api/moods
 * @access  Private (Admin)
 */
const addMood = async (req, res, next) => {
  try {
    const { key, label, description, allowedTones } = req.body;
    const language = req.language || getDefaultLanguage();

    if (!key || typeof key !== 'string' || !key.trim()) {
      const message = getLocalizedMessageFromRequest('mood.error.keyRequired', req) || 'key is required';
      return res.status(400).json({ success: false, message });
    }

    if (!label || typeof label !== 'string' || !label.trim()) {
      const message = getLocalizedMessageFromRequest('mood.error.labelRequired', req) || 'label is required';
      return res.status(400).json({ success: false, message });
    }

    if (!Array.isArray(allowedTones)) {
      const message = getLocalizedMessageFromRequest('mood.error.allowedTonesRequired', req) || 'allowedTones must be an array of strings';
      return res.status(400).json({ success: false, message });
    }

    const mood = await moodService.createMood({ key, label, description, allowedTones }, language);

    const message = getLocalizedMessageFromRequest('mood.create.success', req) || 'Mood created successfully.';
    res.status(201).json({
      success: true,
      message,
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a mood (admin only)
 * @route   PATCH /api/moods/:id
 * @access  Private (Admin)
 */
const updateMood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const language = req.language || getDefaultLanguage();
    const mood = await moodService.updateMood(id, req.body, language);
    const message = getLocalizedMessageFromRequest('mood.update.success', req) || 'Mood updated successfully.';
    res.status(200).json({
      success: true,
      message,
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a mood (admin only)
 * @route   DELETE /api/moods/:id
 * @access  Private (Admin)
 */
const deleteMood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const language = req.language || getDefaultLanguage();
    await moodService.deleteMood(id, language);
    const message = getLocalizedMessageFromRequest('mood.delete.success', req) || 'Mood deleted successfully.';
    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Seed mood scale from data/mood-scale.json (admin only)
 * @route   POST /api/moods/seed/mood-scale
 * @access  Private (Admin)
 */
const seedMoodScale = async (req, res, next) => {
  try {
    const language = req.language || getDefaultLanguage();
    const data = await moodService.seedMoodScaleFromFile(language);
    const message = getLocalizedMessageFromRequest('mood.seed.success', req) || 'Mood scale seeded successfully.';
    res.status(200).json({
      success: true,
      message,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMoods,
  getAllMoodScale,
  getMoodScale,
  addMood,
  updateMood,
  deleteMood,
  seedMoodScale
};
