const mongoose = require('mongoose');

const GENDER_ENUM = ['male', 'female', 'other', 'männlich', 'weiblich'];
const DEFAULT_GENDER = GENDER_ENUM[0];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      default: 'User',
      enum: ['User', 'Admin']
    },
    gender: {
      type: String,
      default: null,
      enum: GENDER_ENUM
    },
    pronouns: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    language: {
      type: String,
      default: process.env.DEFAULT_LANGUAGE || 'en'
    },
    profileImageUrl: {
      type: String,
      default: null
    },
    profileImagePublicId: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema, 'users');
module.exports.GENDER_ENUM = GENDER_ENUM;
module.exports.DEFAULT_GENDER = DEFAULT_GENDER;
