const mongoose = require('mongoose');

const userMoodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    moodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mood',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserMood', userMoodSchema, 'user_moods');
