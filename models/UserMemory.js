const mongoose = require('mongoose');

const userMemorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    basicInfo: {
      type: Map,
      of: String,
      default: {}
    },
    lifeEvents: {
      type: Map,
      of: String,
      default: {}
    },
    preferences: {
      type: Map,
      of: String,
      default: {}
    },
    emotionalPatterns: {
      type: Map,
      of: String,
      default: {}
    },
    lastExtractedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserMemory', userMemorySchema, 'user_memories');