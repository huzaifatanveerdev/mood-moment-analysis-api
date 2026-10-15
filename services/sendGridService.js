const sgMail = require('@sendgrid/mail');
const { getLocalizedMessage, getDefaultLanguage } = require('../utils/localization');
const {
  getRegistrationOtpHtml,
  getPasswordResetOtpHtml,
  getWelcomeEmailHtml
} = require('../utils/emailTemplate');

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const API_KEY = process.env.SENDGRID_API_KEY;

if (API_KEY) {
  sgMail.setApiKey(API_KEY);
}

/**
 * Send registration OTP email via SendGrid
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} language - Language code
 * @returns {Promise<void>}
 */
async function sendRegistrationOtp(email, otp, language = getDefaultLanguage()) {
  if (!API_KEY || !FROM_EMAIL) {
    const message = getLocalizedMessage('auth.email.error.sendGridNotConfigured', language) || 'SendGrid is not configured. SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are required.';
    throw new Error(message);
  }

  const subject = getLocalizedMessage('auth.otp.email.subject', language) || 'Your verification code';
  const intro = getLocalizedMessage('auth.otp.email.intro', language) || 'Please use the following code to verify your email and complete registration:';
  const expiry = getLocalizedMessage('auth.otp.email.expiry', language) || 'This code is valid for 2 minutes.';
  const footer = getLocalizedMessage('auth.email.footer', language) || 'This is an automated email. Please do not reply to this message.';
  const textBody = (getLocalizedMessage('auth.otp.email.body', language) || `Your verification code is: ${otp}. It expires in 2 minutes.`).replace(/\{otp\}/g, otp);
  const html = getRegistrationOtpHtml(subject, intro, otp, expiry, footer);

  await sgMail.send({
    to: email,
    from: FROM_EMAIL,
    subject,
    text: textBody,
    html
  });
}

/**
 * Send password reset OTP email via SendGrid
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} language - Language code
 * @returns {Promise<void>}
 */
async function sendPasswordResetOtp(email, otp, language = getDefaultLanguage()) {
  if (!API_KEY || !FROM_EMAIL) {
    const message = getLocalizedMessage('auth.email.error.sendGridNotConfigured', language) || 'SendGrid is not configured. SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are required.';
    throw new Error(message);
  }

  const subject = getLocalizedMessage('auth.resetPassword.otp.email.subject', language) || 'Your password reset code';
  const intro = getLocalizedMessage('auth.resetPassword.otp.email.intro', language) || 'You have requested to reset your password. Please use the following code to proceed:';
  const expiry = getLocalizedMessage('auth.resetPassword.otp.email.expiry', language) || 'This code is valid for 2 minutes.';
  const ignoreNote = getLocalizedMessage('auth.resetPassword.otp.email.ignoreNote', language) || 'If you did not request a password reset, you can safely ignore this email.';
  const footer = getLocalizedMessage('auth.email.footer', language) || 'This is an automated email. Please do not reply to this message.';
  const textBody = (getLocalizedMessage('auth.resetPassword.otp.email.body', language) || `Your password reset code is: ${otp}. It expires in 2 minutes.`).replace(/\{otp\}/g, otp);
  const html = getPasswordResetOtpHtml(subject, intro, otp, expiry, ignoreNote, footer);

  await sgMail.send({
    to: email,
    from: FROM_EMAIL,
    subject,
    text: textBody,
    html
  });
}

/**
 * Send welcome email via SendGrid
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} language - Language code
 * @returns {Promise<void>}
 */
async function sendWelcomeEmail(email, name, language = getDefaultLanguage()) {
  if (!API_KEY || !FROM_EMAIL) {
    const message = getLocalizedMessage('auth.email.error.sendGridNotConfigured', language) || 'SendGrid is not configured. SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are required.';
    throw new Error(message);
  }

  const subject = getLocalizedMessage('auth.welcome.email.subject', language) || 'Welcome to mood-moment-analysis-api!';
  const fallbackName = getLocalizedMessage('auth.welcome.email.defaultName', language) || 'there';
  const safeName = typeof name === 'string' && name.trim().length > 0 ? name.trim() : fallbackName;
  const body = (getLocalizedMessage('auth.welcome.email.body', language) || `Hello ${safeName}, welcome to mood-moment-analysis-api. We are excited to have you on board.`).replace(/\{name\}/g, safeName);
  const footer = getLocalizedMessage('auth.email.footer', language) || 'This is an automated email. Please do not reply to this message.';
  const html = getWelcomeEmailHtml(subject, body, footer);

  await sgMail.send({
    to: email,
    from: FROM_EMAIL,
    subject,
    text: body,
    html
  });
}

module.exports = {
  sendRegistrationOtp,
  sendPasswordResetOtp,
  sendWelcomeEmail
};
