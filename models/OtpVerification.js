const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  otpType: {
    type: String,
    required: true,
    enum: ['registration', 'reset-password']
  },
  expiresAt: {
    type: Date,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

otpVerificationSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

otpVerificationSchema.methods.incrementAttempts = async function () {
  this.attempts += 1;
  await this.save();
  return this.attempts;
};

module.exports = mongoose.model('OtpVerification', otpVerificationSchema, 'otp_verifications');
