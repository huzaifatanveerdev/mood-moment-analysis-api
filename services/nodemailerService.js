const { google } = require('googleapis');
const { getLocalizedMessage, getDefaultLanguage } = require('../utils/localization');
const {
  getRegistrationOtpHtml,
  getPasswordResetOtpHtml,
  getWelcomeEmailHtml
} = require('../utils/emailTemplate');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground';
const EMAIL_FROM = process.env.EMAIL_FROM;

function isNodemailerConfigured() {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN && EMAIL_FROM);
}

/**
 * Get authenticated Gmail API client (OAuth2, fresh access token).
 * @returns {Promise<{ gmail: object, auth: object }>}
 */
async function getGmailClient() {
  const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

  const { token } = await oAuth2Client.getAccessToken();
  if (!token) {
    throw new Error('Failed to obtain Gmail OAuth2 access token.');
  }
  console.log('📧 Gmail API: access token generated');

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  return { gmail, auth: oAuth2Client };
}

/**
 * Build RFC 2822 MIME message with multipart/alternative (text/plain + text/html).
 * @param {string} from - Sender email
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} text - Plain text body
 * @param {string} html - HTML body
 * @returns {string} Raw MIME message
 */
function buildMimeMessage(from, to, subject, text, html) {
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const utf8Subject = `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(text, 'utf8').toString('base64'),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(html, 'utf8').toString('base64'),
    `--${boundary}--`
  ];
  return lines.join('\r\n');
}

/**
 * Encode MIME message as Base64URL and send via Gmail API users.messages.send.
 * Uses HTTPS (port 443) only; no SMTP.
 * @param {string} from - Sender email
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} text - Plain text body
 * @param {string} html - HTML body
 * @returns {Promise<void>}
 */
async function sendViaGmailApi(from, to, subject, text, html) {
  const rawMime = buildMimeMessage(from, to, subject, text, html);
  console.log('📧 Gmail API: raw MIME message', rawMime);
  const encodedMessage = Buffer.from(rawMime, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  console.log('calling getGmailClient())');
  const { gmail } = await getGmailClient();
  console.log('getGmailClient:', gmail);
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage }
  });
}

/**
 * Send registration OTP email via Gmail API
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} language - Language code
 * @returns {Promise<void>}
 */
async function sendRegistrationOtp(email, otp, language = getDefaultLanguage()) {
  if (!isNodemailerConfigured()) {
    const message = getLocalizedMessage('auth.email.error.nodemailerNotConfigured', language) || 'Nodemailer is not configured. GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN and EMAIL_FROM are required.';
    throw new Error(message);
  }

  if (!EMAIL_FROM) {
    throw new Error('EMAIL_FROM is required.');
  }

  const subject = getLocalizedMessage('auth.otp.email.subject', language) || 'Your verification code';
  const intro = getLocalizedMessage('auth.otp.email.intro', language) || 'Please use the following code to verify your email and complete registration:';
  const expiry = getLocalizedMessage('auth.otp.email.expiry', language) || 'This code is valid for 2 minutes.';
  const footer = getLocalizedMessage('auth.email.footer', language) || 'This is an automated email. Please do not reply to this message.';
  const textBody = (getLocalizedMessage('auth.otp.email.body', language) || `Your verification code is: ${otp}. It expires in 2 minutes.`).replace(/\{otp\}/g, otp);
  const html = getRegistrationOtpHtml(subject, intro, otp, expiry, footer);

  try {
    await sendViaGmailApi(EMAIL_FROM, email, subject, textBody, html);
    console.log('📧 Gmail API: registration OTP email sent to', email);
  } catch (err) {
    console.error('❌ Gmail API: send registration OTP failed', err.message || err);
    throw err;
  }
}

/**
 * Send password reset OTP email via Gmail API
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} language - Language code
 * @returns {Promise<void>}
 */
async function sendPasswordResetOtp(email, otp, language = getDefaultLanguage()) {
  if (!isNodemailerConfigured()) {
    const message = getLocalizedMessage('auth.email.error.nodemailerNotConfigured', language) || 'Nodemailer is not configured. GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN and EMAIL_FROM are required.';
    throw new Error(message);
  }

  if (!EMAIL_FROM) {
    throw new Error('EMAIL_FROM is required.');
  }

  const subject = getLocalizedMessage('auth.resetPassword.otp.email.subject', language) || 'Your password reset code';
  const intro = getLocalizedMessage('auth.resetPassword.otp.email.intro', language) || 'You have requested to reset your password. Please use the following code to proceed:';
  const expiry = getLocalizedMessage('auth.resetPassword.otp.email.expiry', language) || 'This code is valid for 2 minutes.';
  const ignoreNote = getLocalizedMessage('auth.resetPassword.otp.email.ignoreNote', language) || 'If you did not request a password reset, you can safely ignore this email.';
  const footer = getLocalizedMessage('auth.email.footer', language) || 'This is an automated email. Please do not reply to this message.';
  const textBody = (getLocalizedMessage('auth.resetPassword.otp.email.body', language) || `Your password reset code is: ${otp}. It expires in 2 minutes.`).replace(/\{otp\}/g, otp);
  const html = getPasswordResetOtpHtml(subject, intro, otp, expiry, ignoreNote, footer);

  try {
    await sendViaGmailApi(EMAIL_FROM, email, subject, textBody, html);
    console.log('📧 Gmail API: password reset OTP email sent to', email);
  } catch (err) {
    console.error('❌ Gmail API: send password reset OTP failed', err.message || err);
    throw err;
  }
}

/**
 * Send welcome email via Gmail API
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} language - Language code
 * @returns {Promise<void>}
 */
async function sendWelcomeEmail(email, name, language = getDefaultLanguage()) {
  if (!isNodemailerConfigured()) {
    const message = getLocalizedMessage('auth.email.error.nodemailerNotConfigured', language) || 'Nodemailer is not configured. GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN and EMAIL_FROM are required.';
    throw new Error(message);
  }

  if (!EMAIL_FROM) {
    throw new Error('EMAIL_FROM is required.');
  }

  const subject = getLocalizedMessage('auth.welcome.email.subject', language) || 'Welcome to mood-moment-analysis-api!';
  const fallbackName = getLocalizedMessage('auth.welcome.email.defaultName', language) || 'there';
  const safeName = typeof name === 'string' && name.trim().length > 0 ? name.trim() : fallbackName;
  const body = (getLocalizedMessage('auth.welcome.email.body', language) || `Hello ${safeName}, welcome to mood-moment-analysis-api. We are excited to have you on board.`).replace(/\{name\}/g, safeName);
  const footer = getLocalizedMessage('auth.email.footer', language) || 'This is an automated email. Please do not reply to this message.';
  const html = getWelcomeEmailHtml(subject, body, footer);

  try {
    await sendViaGmailApi(EMAIL_FROM, email, subject, body, html);
    console.log('📧 Gmail API: welcome email sent to', email);
  } catch (err) {
    console.error('❌ Gmail API: send welcome email failed', err.message || err);
    throw err;
  }
}

module.exports = {
  sendRegistrationOtp,
  sendPasswordResetOtp,
  sendWelcomeEmail
};
