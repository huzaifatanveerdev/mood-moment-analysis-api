const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      default: null,
      trim: true
    },
    isFreeChat: {
      type: Boolean,
      default: false
    },
    isMoodScaleChat: {
      type: Boolean,
      default: false
    },
    unprocessedMessageCount: {
      type: Number,
      default: 0
    },
    lastExtractedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema, 'chats');