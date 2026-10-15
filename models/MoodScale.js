const mongoose = require('mongoose');

const moodScaleSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    scale: {
      type: Number,
      min: 1,
      max: 10,
      sparse: true,
      unique: true
    },
    labelEn: {
      type: String,
      required: true,
      trim: true
    },
    labelDe: {
      type: String,
      trim: true
    },
    promptEn: {
      type: String,
      trim: true
    },
    promptDe: {
      type: String,
      trim: true
    },
    feelingEn: {
      type: String,
      trim: true
    },
    feelingDe: {
      type: String,
      trim: true
    },
    styleEn: {
      type: String,
      trim: true
    },
    styleDe: {
      type: String,
      trim: true
    },
    responseHintEn: {
      type: String,
      trim: true
    },
    responseHintDe: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MoodScale', moodScaleSchema, 'mood_scale');
