const mongoose = require('mongoose');

/**
 * One row per mood-scale chat: denormalized MoodScale fields at session start
 * so follow-up messages do not re-query mood_scale.
 */
const chatMoodSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      unique: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    moodScaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MoodScale',
      required: true
    },
    key: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    scale: {
      type: Number,
      min: 1,
      max: 10
    },
    labelEn: { type: String, trim: true },
    labelDe: { type: String, trim: true },
    promptEn: { type: String, trim: true },
    promptDe: { type: String, trim: true },
    feelingEn: { type: String, trim: true },
    feelingDe: { type: String, trim: true },
    styleEn: { type: String, trim: true },
    styleDe: { type: String, trim: true },
    responseHintEn: { type: String, trim: true },
    responseHintDe: { type: String, trim: true }
  },
  { timestamps: true }
);

chatMoodSchema.index({ userId: 1, chatId: 1 });

module.exports = mongoose.model('ChatMood', chatMoodSchema, 'chat_mood');
