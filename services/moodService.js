const fs = require('fs');
const path = require('path');
const Mood = require('../models/Mood');
const MoodScale = require('../models/MoodScale');
const { AppError } = require('../utils/errors');
const {
  getLocalizedMessage,
  getDefaultLanguage,
  supportedLanguages
} = require('../utils/localization');

const MOOD_SCALE_DATA_PATH = path.join(__dirname, '../data/mood-scale.json');

/**
 * Create a new mood
 * @param {object} data - { key, label, description?, allowedTones }
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
const createMood = async (data, language = getDefaultLanguage()) => {
  const { key, label, description, allowedTones } = data || {};

  if (!key || typeof key !== 'string' || !key.trim()) {
    const message = getLocalizedMessage('mood.error.keyRequired', language) || 'key is required';
    throw new AppError(message, 400);
  }

  if (!label || typeof label !== 'string' || !label.trim()) {
    const message = getLocalizedMessage('mood.error.labelRequired', language) || 'label is required';
    throw new AppError(message, 400);
  }

  if (!Array.isArray(allowedTones)) {
    const message = getLocalizedMessage('mood.error.allowedTonesRequired', language) || 'allowedTones must be an array of strings';
    throw new AppError(message, 400);
  }

  const trimmedKey = key.trim().toLowerCase();
  const trimmedLabel = label.trim();
  const validTones = allowedTones.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim());

  const existing = await Mood.findOne({ key: trimmedKey });
  if (existing) {
    const msg = getLocalizedMessage('mood.error.keyExists', language) || `Mood with key "${trimmedKey}" already exists.`;
    const message = msg.replace(/\{key\}/g, trimmedKey);
    throw new AppError(message, 400);
  }

  const mood = await Mood.create({
    key: trimmedKey,
    label: trimmedLabel,
    description: typeof description === 'string' ? description.trim() : undefined,
    allowedTones: validTones,
    isActive: true
  });

  return mood.toObject();
};

/**
 * Get all moods
 * @returns {Promise<Array>}
 */
const getAllMoods = async () => {
  const moods = await Mood.find().select('_id key label description allowedTones isActive').lean();
  return moods;
};

/**
 * All mood scale rows (1–10), sorted by scale
 */
const getAllMoodScale = async () => {
  const rows = await MoodScale.find({ isActive: true }).sort({ scale: 1 }).lean();
  return rows;
};

/**
 * All mood scale rows with label, prompt, feeling, style, responseHint for the given language (no En/De suffixes).
 * Unlike getAllMoodScale(), returns a single locale per field based on `language` (e.g. Accept-Language).
 */
const getAllMoodScaleLocalizedTODO = async (language = getDefaultLanguage()) => { // TODO: WE WILL NEED THIS LATER
  const lang = supportedLanguages.includes(language) ? language : getDefaultLanguage();
  const isDe = lang === 'de';

  const rows = await MoodScale.find({ isActive: true }).sort({ scale: 1 }).lean();

  return rows.map((doc) => ({
    _id: doc._id,
    key: doc.key,
    scale: doc.scale,
    label: isDe ? doc.labelDe || doc.labelEn : doc.labelEn,
    prompt: isDe ? doc.promptDe || doc.promptEn : doc.promptEn,
    feeling: isDe ? doc.feelingDe || doc.feelingEn : doc.feelingEn,
    style: isDe ? doc.styleDe || doc.styleEn : doc.styleEn,
    responseHint: isDe ? doc.responseHintDe || doc.responseHintEn : doc.responseHintEn
  }));
};

const getAllMoodScaleLocalized = async (language = getDefaultLanguage()) => {
  const lang = supportedLanguages.includes(language) ? language : getDefaultLanguage();
  const isDe = lang === 'de';

  const rows = await MoodScale.find({ isActive: true }).sort({ scale: 1 }).lean();

  return rows.map((doc) => ({
    _id: doc._id,
    key: doc.key,
    scale: doc.scale,
    label: isDe ? doc.labelDe || doc.labelEn : doc.labelEn
  }));
};

/**
 * Upsert mood scale entries from data/mood-scale.json (synchronous read + DB writes).
 */
const seedMoodScaleFromFile = async (language = getDefaultLanguage()) => {
  let raw;
  try {
    raw = fs.readFileSync(MOOD_SCALE_DATA_PATH, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      const message = getLocalizedMessage('mood.seed.error.fileNotFound', language) || 'Mood scale data file not found.';
      throw new AppError(message, 500);
    }
    const message = getLocalizedMessage('mood.seed.error.readFailed', language) || 'Could not read mood scale data file.';
    throw new AppError(message, 500);
  }

  let items;
  try {
    items = JSON.parse(raw);
  } catch {
    const message = getLocalizedMessage('mood.seed.error.invalidJson', language) || 'Mood scale data file is not valid JSON.';
    throw new AppError(message, 400);
  }

  if (!Array.isArray(items)) {
    const message = getLocalizedMessage('mood.seed.error.invalidFormat', language) || 'Mood scale data must be a JSON array.';
    throw new AppError(message, 400);
  }

  let processed = 0;

  for (const item of items) {
    const key = typeof item.key === 'string' ? item.key.trim().toLowerCase() : '';
    if (!key) continue;

    const scaleNum = typeof item.number === 'number' ? item.number : parseInt(item.number, 10);
    if (Number.isNaN(scaleNum) || scaleNum < 1 || scaleNum > 10) continue;

    await MoodScale.updateMany(
      { scale: scaleNum, key: { $ne: key } },
      { $unset: { scale: 1 } }
    );

    const labelEnVal = String(item.labelEn || item.label || '').trim();

    const str = (v) => (typeof v === 'string' ? v.trim() : '');

    const setDoc = {
      key,
      labelEn: labelEnVal,
      labelDe: str(item.labelDe),
      promptEn: str(item.promptEn),
      promptDe: str(item.promptDe),
      feelingEn: str(item.feelingEn),
      feelingDe: str(item.feelingDe),
      styleEn: str(item.styleEn),
      styleDe: str(item.styleDe),
      responseHintEn: str(item.responseHintEn),
      responseHintDe: str(item.responseHintDe),
      scale: scaleNum,
      isActive: true
    };

    await MoodScale.findOneAndUpdate(
      { key },
      {
        $set: setDoc,
        $unset: {
          allowedTones: 1,
          description: 1,
          descriptionDe: 1,
          label: 1
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    processed += 1;
  }

  return { processed, totalInFile: items.length };
};

/**
 * Update a mood by id
 * @param {string} moodId - Mood _id
 * @param {object} updates - { key?, label?, description?, allowedTones?, isActive? }
 * @param {string} language - Language code
 * @returns {Promise<object>}
 */
const updateMood = async (moodId, updates, language = getDefaultLanguage()) => {
  if (!moodId) {
    const message = getLocalizedMessage('mood.error.idRequired', language) || 'Mood ID is required';
    throw new AppError(message, 400);
  }

  const mood = await Mood.findById(moodId);
  if (!mood) {
    const message = getLocalizedMessage('mood.error.notFound', language) || 'Mood not found';
    throw new AppError(message, 404);
  }

  const { key, label, description, allowedTones, isActive } = updates || {};

  if (key !== undefined) {
    if (typeof key !== 'string' || !key.trim()) {
      const message = getLocalizedMessage('mood.error.keyInvalid', language) || 'key must be a non-empty string';
      throw new AppError(message, 400);
    }
    const trimmedKey = key.trim().toLowerCase();
    const existing = await Mood.findOne({ key: trimmedKey, _id: { $ne: moodId } });
    if (existing) {
      const msg = getLocalizedMessage('mood.error.keyExists', language) || `Mood with key "${trimmedKey}" already exists.`;
      const message = msg.replace(/\{key\}/g, trimmedKey);
      throw new AppError(message, 400);
    }
    mood.key = trimmedKey;
  }

  if (label !== undefined) {
    if (typeof label !== 'string' || !label.trim()) {
      const message = getLocalizedMessage('mood.error.labelInvalid', language) || 'label must be a non-empty string';
      throw new AppError(message, 400);
    }
    mood.label = label.trim();
  }

  if (description !== undefined) {
    mood.description = typeof description === 'string' ? description.trim() : description;
  }

  if (allowedTones !== undefined) {
    if (!Array.isArray(allowedTones)) {
      const message = getLocalizedMessage('mood.error.allowedTonesRequired', language) || 'allowedTones must be an array of strings';
      throw new AppError(message, 400);
    }
    mood.allowedTones = allowedTones.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim());
  }

  if (isActive !== undefined) {
    mood.isActive = Boolean(isActive);
  }

  await mood.save();
  return mood.toObject();
};

/**
 * Delete a mood by id
 * @param {string} moodId - Mood _id
 * @param {string} language - Language code
 * @returns {Promise<void>}
 */
const deleteMood = async (moodId, language = getDefaultLanguage()) => {
  if (!moodId) {
    const message = getLocalizedMessage('mood.error.idRequired', language) || 'Mood ID is required';
    throw new AppError(message, 400);
  }

  const mood = await Mood.findByIdAndDelete(moodId);
  if (!mood) {
    const message = getLocalizedMessage('mood.error.notFound', language) || 'Mood not found';
    throw new AppError(message, 404);
  }
};

module.exports = {
  createMood,
  getAllMoods,
  getAllMoodScale,
  getAllMoodScaleLocalized,
  seedMoodScaleFromFile,
  updateMood,
  deleteMood
};
