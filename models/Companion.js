const mongoose = require('mongoose');

const COMPANION_GENDER_ENUM = ['male', 'female', 'neutral'];

const companionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    imageUrl: {
      // Cloudinary hosted URL (safe to expose to clients).
      type: String,
      required: true,
      trim: true
    },

    imagePublicId: {
      // Cloudinary asset identifier (store only; do not return).
      type: String,
      default: null
    },

    gender: {
      type: String,
      required: true,
      enum: COMPANION_GENDER_ENUM
    },

    name: {
      type: String,
      required: false,
      default: 'mood-moment-analysis-api',
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.imagePublicId; // never expose to API responses
        return ret;
      }
    },
    toObject: {
      transform: (_doc, ret) => {
        delete ret.imagePublicId; // never expose to API responses
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Companion', companionSchema, 'companions');
module.exports.COMPANION_GENDER_ENUM = COMPANION_GENDER_ENUM;
