const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true
    },
    label: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    allowedTones: {
      type: [String],
      required: true,
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mood', moodSchema, 'moods');
