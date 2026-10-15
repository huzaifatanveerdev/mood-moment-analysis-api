const path = require('path');
const fs = require('fs');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'emails');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

function loadTemplate(filename) {
  const filePath = path.join(TEMPLATES_DIR, filename);
  return fs.readFileSync(filePath, 'utf8');
}

function replacePlaceholders(html, map) {
  let result = html;
  for (const [key, value] of Object.entries(map)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(placeholder, value);
  }
  return result;
}

/**
 * Get HTML for registration OTP email. OTP is in a copyable styled box.
 * @param {string} title - Email title (e.g. subject)
 * @param {string} intro - Localized intro text
 * @param {string} otp - 6-digit OTP (not escaped)
 * @param {string} expiry - Localized expiry text
 * @param {string} footer - Localized footer text
 * @returns {string} HTML string
 */
function getRegistrationOtpHtml(title, intro, otp, expiry, footer) {
  const html = loadTemplate('registration-otp.html');
  return replacePlaceholders(html, {
    TITLE: escapeHtml(title),
    INTRO: escapeHtml(intro),
    OTP: String(otp),
    EXPIRY: escapeHtml(expiry),
    FOOTER: escapeHtml(footer)
  });
}

/**
 * Get HTML for password reset OTP email. OTP is in a copyable styled box.
 * @param {string} title - Email title
 * @param {string} intro - Localized intro text
 * @param {string} otp - 6-digit OTP (not escaped)
 * @param {string} expiry - Localized expiry text
 * @param {string} ignoreNote - Localized "ignore this email" text
 * @param {string} footer - Localized footer text
 * @returns {string} HTML string
 */
function getPasswordResetOtpHtml(title, intro, otp, expiry, ignoreNote, footer) {
  const html = loadTemplate('password-reset-otp.html');
  return replacePlaceholders(html, {
    TITLE: escapeHtml(title),
    INTRO: escapeHtml(intro),
    OTP: String(otp),
    EXPIRY: escapeHtml(expiry),
    IGNORE_NOTE: escapeHtml(ignoreNote),
    FOOTER: escapeHtml(footer)
  });
}

/**
 * Get HTML for welcome email.
 * @param {string} title - Email title
 * @param {string} body - Body text (escaped, newlines to <br>)
 * @param {string} footer - Localized footer text
 * @returns {string} HTML string
 */
function getWelcomeEmailHtml(title, body, footer) {
  const html = loadTemplate('welcome.html');
  return replacePlaceholders(html, {
    TITLE: escapeHtml(title),
    BODY: escapeHtml(body).replace(/\n/g, '<br>'),
    FOOTER: escapeHtml(footer)
  });
}

/**
 * Get HTML email content from base template. Replaces {{TITLE}} and {{BODY}}.
 * Body is escaped for HTML; newlines become <br>.
 * @param {string} title - Email title (e.g. subject)
 * @param {string} body - Plain text body (may contain newlines)
 * @returns {string} HTML string
 */
function getEmailHtml(title, body) {
  const escaped = escapeHtml(body).replace(/\n/g, '<br>');
  const html = loadTemplate('base.html');
  return replacePlaceholders(html, { TITLE: escapeHtml(title), BODY: escaped });
}

module.exports = {
  getEmailHtml,
  getRegistrationOtpHtml,
  getPasswordResetOtpHtml,
  getWelcomeEmailHtml
};
