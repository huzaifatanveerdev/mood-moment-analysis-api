// Localization utilities

const getDefaultLanguage = () => process.env.DEFAULT_LANGUAGE || 'en';

// Supported languages and their message dictionaries
const messages = {
  en: {
    'test.hello.success': 'Hello. This project is up and running.',
    'test.hello.message': 'Hello. This project is up and running.',
    
    // User messages
    'user.profile.success': 'User details retrieved successfully.',
    'user.profile.error.notFound': 'User not found.',
    'user.profile.error.unauthorized': 'Authentication required.',
    'user.delete.success': 'Account deleted successfully.',
    'user.delete.error.notFound': 'User not found.',
    'user.profileImage.upload.success': 'Profile image uploaded successfully.',
    'user.profileImage.get.success': 'Profile image retrieved successfully.',
    'user.profileImage.error.notFound': 'No profile image found.',
    'user.profileImage.error.noFile': 'No image file provided.',
    'user.profileImage.error.cloudinaryNotConfigured': 'Image upload is not configured.',
    'user.profile.update.success': 'Profile updated successfully.',
    'user.profile.update.error.nameRequired': 'Name cannot be empty.',
    'user.profile.update.error.invalidGender': 'Invalid gender.',
    'user.profile.update.error.invalidDate': 'Invalid date of birth.',
    'user.language.update.success': 'Language updated successfully.',
    'user.language.get.success': 'Language retrieved successfully.',
    'user.language.error.invalid': 'Invalid language. Use en, de, English or German.',
    
    // Auth / OTP / User messages
    'auth.requestOtp.success': 'OTP sent successfully. Check your email.',
    'auth.requestOtp.error.invalidEmail': 'Invalid email format.',
    'auth.requestOtp.error.userExists': 'An account with this email already exists.',
    'auth.requestOtp.error.failed': 'Failed to send OTP.',
    'auth.verifyOtp.success': 'OTP verified successfully.',
    'auth.verifyOtp.error.required': 'Email and OTP are required.',
    'auth.verifyOtp.error.invalidOrExpired': 'Invalid or expired OTP.',
    'auth.verifyOtp.error.maxAttempts': 'Maximum attempts exceeded. Please request a new OTP.',
    'auth.verifyOtp.error.failed': 'Failed to verify OTP.',
    'auth.register.success': 'Registration successful.',
    'auth.register.error.unauthorized': 'Valid temporary token required.',
    'auth.register.error.invalidToken': 'Invalid or expired token. Please complete OTP verification again.',
    'auth.register.error.fieldsRequired': 'Email, name, password and confirmPassword are required.',
    'auth.register.error.passwordMismatch': 'Passwords do not match.',
    'auth.register.error.passwordTooShort': 'Password must be at least 6 characters.',
    'auth.register.error.failed': 'Registration failed.',
    'auth.otp.email.subject': 'Your verification code',
    'auth.otp.email.body': 'Your verification code is: {otp}. It expires in 2 minutes.',
    'auth.otp.email.intro': 'Please use the following code to verify your email and complete registration:',
    'auth.otp.email.expiry': 'This code is valid for 2 minutes.',
    'auth.resetPassword.otp.email.intro': 'You have requested to reset your password. Please use the following code to proceed:',
    'auth.resetPassword.otp.email.expiry': 'This code is valid for 2 minutes.',
    'auth.resetPassword.otp.email.ignoreNote': 'If you did not request a password reset, you can safely ignore this email.',
    'auth.email.footer': 'This is an automated email. Please do not reply to this message.',
    'auth.email.error.nodemailerNotConfigured': 'Nodemailer is not configured. GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN and EMAIL_FROM are required.',
    'auth.email.error.sendGridNotConfigured': 'SendGrid is not configured. SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are required.',
    'auth.welcome.email.subject': 'Welcome to mood-moment-analysis-api!',
    'auth.welcome.email.body': 'Hello {name}, welcome to mood-moment-analysis-api. We are excited to have you on board.',
    'auth.welcome.email.defaultName': 'there',
    
    // Login messages
    'auth.login.success': 'Login successful.',
    'auth.login.error.emailRequired': 'Email is required.',
    'auth.login.error.invalidEmail': 'Invalid email format.',
    'auth.login.error.passwordRequired': 'Password is required.',
    'auth.login.error.emailNotFound': 'No account exists with this email.',
    'auth.login.error.incorrectPassword': 'Password is incorrect.',
    'auth.login.error.failed': 'Login failed.',
    
    // Forgot password / reset flow
    'auth.forgotPassword.success': 'If an account exists with this email, you will receive an OTP.',
    'auth.forgotPassword.error.invalidEmail': 'Invalid email format.',
    'auth.forgotPassword.error.failed': 'Failed to process request.',
    'auth.resetPassword.otp.email.subject': 'Your password reset code',
    'auth.resetPassword.otp.email.body': 'Your password reset code is: {otp}. It expires in 2 minutes.',
    'auth.resetPassword.otp.email.intro': 'You have requested to reset your password. Please use the following code to proceed:',
    'auth.resetPassword.otp.email.expiry': 'This code is valid for 2 minutes.',
    'auth.resetPassword.otp.email.ignoreNote': 'If you did not request a password reset, you can safely ignore this email.',
    'auth.verifyResetOtp.success': 'OTP verified successfully. You can now reset your password.',
    'auth.verifyResetOtp.error.required': 'Email and OTP are required.',
    'auth.verifyResetOtp.error.invalidOrExpired': 'Invalid or expired OTP.',
    'auth.verifyResetOtp.error.maxAttempts': 'Maximum attempts exceeded. Please request a new OTP.',
    'auth.verifyResetOtp.error.failed': 'Failed to verify OTP.',
    'auth.resetPassword.success': 'Password reset successful.',
    'auth.resetPassword.error.unauthorized': 'Valid temporary token required.',
    'auth.resetPassword.error.invalidToken': 'Invalid or expired token. Please complete OTP verification again.',
    'auth.resetPassword.error.fieldsRequired': 'New password and confirm password are required.',
    'auth.resetPassword.error.passwordMismatch': 'Passwords do not match.',
    'auth.resetPassword.error.passwordTooShort': 'Password must be at least 6 characters.',
    'auth.resetPassword.error.failed': 'Password reset failed.',
    'auth.changePassword.success': 'Password changed successfully.',
    'auth.changePassword.error.currentPasswordRequired': 'Current password is required.',
    'auth.changePassword.error.currentPasswordWrong': 'Current password is incorrect.',

    // Mood messages
    'mood.get.success': 'Moods retrieved successfully.',
    'mood.scale.get.success': 'Mood scale retrieved successfully.',
    'mood.scale.item.get.success': 'Mood scale retrieved successfully.',
    'mood.create.success': 'Mood created successfully.',
    'mood.update.success': 'Mood updated successfully.',
    'mood.delete.success': 'Mood deleted successfully.',
    'mood.error.keyRequired': 'key is required',
    'mood.error.labelRequired': 'label is required',
    'mood.error.allowedTonesRequired': 'allowedTones must be an array of strings',
    'mood.error.keyExists': 'Mood with key "{key}" already exists.',
    'mood.error.idRequired': 'Mood ID is required',
    'mood.error.notFound': 'Mood not found',
    'mood.error.keyInvalid': 'key must be a non-empty string',
    'mood.error.labelInvalid': 'label must be a non-empty string',
    'mood.seed.success': 'Mood scale seeded successfully.',
    'mood.seed.error.fileNotFound': 'Mood scale data file was not found.',
    'mood.seed.error.readFailed': 'Could not read mood scale data file.',
    'mood.seed.error.invalidJson': 'Mood scale data file is not valid JSON.',
    'mood.seed.error.invalidFormat': 'Mood scale data must be a JSON array.',

    // Companion messages
    'companion.get.success': 'Companion retrieved successfully.',
    'companion.create.success': 'Companion created successfully.',
    'companion.update.success': 'Companion updated successfully.',
    'companion.error.alreadyExists': 'Companion already exists for this user.',
    'companion.error.notFound': 'Companion not found.',
    'companion.error.nameRequired': 'Name is required.',
    'companion.error.genderRequired': 'Gender is required.',
    'companion.error.invalidGender': 'Invalid gender. Use male, female, or neutral.',
    'companion.error.toneRequired': 'Tone is required.',
    'companion.error.invalidTone': 'Invalid tone. Use calm, warm, playful, caring, or flirty_soft.',

    // User mood messages
    'userMood.set.success': 'Mood updated successfully.',
    'userMood.get.success': 'Mood retrieved successfully.',
    'userMood.error.moodIdRequired': 'Mood ID is required.',
    'userMood.error.moodNotFound': 'Mood not found.',
    'userMood.error.notSet': 'No mood selected.',

    // Chat messages
    'chat.create.success': 'Chat created successfully.',
    'chat.list.success': 'Chats retrieved successfully.',
    'chat.get.success': 'Chat retrieved successfully.',
    'chat.delete.success': 'Chat deleted successfully.',
    'chat.messages.get.success': 'Messages retrieved successfully.',
    'chat.message.send.success': 'Message sent successfully.',
    'chat.message.error.contentRequired': 'Message content is required.',
    'chat.start.success': 'Chat start acknowledged.',
    'chat.start.error.moodScaleIdRequired': 'Mood scale id is required.',
    'chat.start.error.moodScaleNotFound': 'Mood scale not found.',
    'chat.start.error.moodPromptMissing': 'This mood scale has no prompt text for your language.',
    'chat.mood.message.error.notMoodChat': 'This chat is not a mood-scale conversation.',
    'chat.mood.message.error.moodContextMissing': 'Mood context for this chat was not found.'
  },
  de: {
    'test.hello.success': 'Hallo. Dieses Projekt läuft.',
    'test.hello.message': 'Hallo. Dieses Projekt läuft.',
    
    // User messages
    'user.profile.success': 'Benutzerdetails erfolgreich abgerufen.',
    'user.profile.error.notFound': 'Benutzer nicht gefunden.',
    'user.profile.error.unauthorized': 'Authentifizierung erforderlich.',
    'user.delete.success': 'Konto erfolgreich gelöscht.',
    'user.delete.error.notFound': 'Benutzer nicht gefunden.',
    'user.profileImage.upload.success': 'Profilbild erfolgreich hochgeladen.',
    'user.profileImage.get.success': 'Profilbild erfolgreich abgerufen.',
    'user.profileImage.error.notFound': 'Kein Profilbild gefunden.',
    'user.profileImage.error.noFile': 'Keine Bilddatei angegeben.',
    'user.profileImage.error.cloudinaryNotConfigured': 'Bildupload ist nicht konfiguriert.',
    'user.profile.update.success': 'Profil erfolgreich aktualisiert.',
    'user.profile.update.error.nameRequired': 'Name darf nicht leer sein.',
    'user.profile.update.error.invalidGender': 'Ungültiges Geschlecht.',
    'user.profile.update.error.invalidDate': 'Ungültiges Geburtsdatum.',
    'user.language.update.success': 'Sprache erfolgreich aktualisiert.',
    'user.language.get.success': 'Sprache erfolgreich abgerufen.',
    'user.language.error.invalid': 'Ungültige Sprache. Verwenden Sie en, de, English oder German.',
    
    // Auth / OTP / User messages
    'auth.requestOtp.success': 'OTP erfolgreich gesendet. Prüfen Sie Ihre E-Mail.',
    'auth.requestOtp.error.invalidEmail': 'Ungültiges E-Mail-Format.',
    'auth.requestOtp.error.userExists': 'Ein Konto mit dieser E-Mail existiert bereits.',
    'auth.requestOtp.error.failed': 'OTP konnte nicht gesendet werden.',
    'auth.verifyOtp.success': 'OTP erfolgreich verifiziert.',
    'auth.verifyOtp.error.required': 'E-Mail und OTP sind erforderlich.',
    'auth.verifyOtp.error.invalidOrExpired': 'Ungültiges oder abgelaufenes OTP.',
    'auth.verifyOtp.error.maxAttempts': 'Maximale Versuche überschritten. Bitte fordern Sie ein neues OTP an.',
    'auth.verifyOtp.error.failed': 'OTP-Verifizierung fehlgeschlagen.',
    'auth.register.success': 'Registrierung erfolgreich.',
    'auth.register.error.unauthorized': 'Gültiges temporäres Token erforderlich.',
    'auth.register.error.invalidToken': 'Ungültiges oder abgelaufenes Token. Bitte OTP-Verifizierung erneut durchführen.',
    'auth.register.error.fieldsRequired': 'E-Mail, Name, Passwort und Bestätigung sind erforderlich.',
    'auth.register.error.passwordMismatch': 'Passwörter stimmen nicht überein.',
    'auth.register.error.passwordTooShort': 'Passwort muss mindestens 6 Zeichen haben.',
    'auth.register.error.failed': 'Registrierung fehlgeschlagen.',
    'auth.otp.email.subject': 'Ihr Bestätigungscode',
    'auth.otp.email.body': 'Ihr Bestätigungscode lautet: {otp}. Er läuft in 2 Minuten ab.',
    'auth.otp.email.intro': 'Bitte verwenden Sie den folgenden Code zur E-Mail-Bestätigung und zum Abschluss der Registrierung:',
    'auth.otp.email.expiry': 'Dieser Code ist 2 Minuten gültig.',
    'auth.resetPassword.otp.email.intro': 'Sie haben die Zurücksetzung Ihres Passworts angefordert. Bitte verwenden Sie den folgenden Code:',
    'auth.resetPassword.otp.email.expiry': 'Dieser Code ist 2 Minuten gültig.',
    'auth.resetPassword.otp.email.ignoreNote': 'Wenn Sie die Passwort-Zurücksetzung nicht angefordert haben, können Sie diese E-Mail ignorieren.',
    'auth.email.footer': 'Dies ist eine automatische E-Mail. Bitte antworten Sie nicht auf diese Nachricht.',
    'auth.email.error.nodemailerNotConfigured': 'Nodemailer ist nicht konfiguriert. GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN und EMAIL_FROM sind erforderlich.',
    'auth.email.error.sendGridNotConfigured': 'SendGrid ist nicht konfiguriert. SENDGRID_API_KEY und SENDGRID_FROM_EMAIL sind erforderlich.',
    'auth.welcome.email.subject': 'Willkommen bei mood-moment-analysis-api!',
    'auth.welcome.email.body': 'Hallo {name}, willkommen bei mood-moment-analysis-api. Wir freuen uns, dich an Bord zu haben.',
    'auth.welcome.email.defaultName': 'Freund',
    
    // Login messages
    'auth.login.success': 'Anmeldung erfolgreich.',
    'auth.login.error.emailRequired': 'E-Mail ist erforderlich.',
    'auth.login.error.invalidEmail': 'Ungültiges E-Mail-Format.',
    'auth.login.error.passwordRequired': 'Passwort ist erforderlich.',
    'auth.login.error.emailNotFound': 'Mit dieser E-Mail existiert kein Konto.',
    'auth.login.error.incorrectPassword': 'Passwort ist falsch.',
    'auth.login.error.failed': 'Anmeldung fehlgeschlagen.',
    
    // Forgot password / reset flow
    'auth.forgotPassword.success': 'Falls ein Konto mit dieser E-Mail existiert, erhalten Sie einen OTP.',
    'auth.forgotPassword.error.invalidEmail': 'Ungültiges E-Mail-Format.',
    'auth.forgotPassword.error.failed': 'Anfrage konnte nicht verarbeitet werden.',
    'auth.resetPassword.otp.email.subject': 'Ihr Code zum Zurücksetzen des Passworts',
    'auth.resetPassword.otp.email.body': 'Ihr Code zum Zurücksetzen des Passworts lautet: {otp}. Er läuft in 2 Minuten ab.',
    'auth.resetPassword.otp.email.intro': 'Sie haben die Zurücksetzung Ihres Passworts angefordert. Bitte verwenden Sie den folgenden Code:',
    'auth.resetPassword.otp.email.expiry': 'Dieser Code ist 2 Minuten gültig.',
    'auth.resetPassword.otp.email.ignoreNote': 'Wenn Sie die Passwort-Zurücksetzung nicht angefordert haben, können Sie diese E-Mail ignorieren.',
    'auth.verifyResetOtp.success': 'OTP erfolgreich verifiziert. Sie können jetzt Ihr Passwort zurücksetzen.',
    'auth.verifyResetOtp.error.required': 'E-Mail und OTP sind erforderlich.',
    'auth.verifyResetOtp.error.invalidOrExpired': 'Ungültiges oder abgelaufenes OTP.',
    'auth.verifyResetOtp.error.maxAttempts': 'Maximale Versuche überschritten. Bitte fordern Sie ein neues OTP an.',
    'auth.verifyResetOtp.error.failed': 'OTP-Verifizierung fehlgeschlagen.',
    'auth.resetPassword.success': 'Passwort erfolgreich zurückgesetzt.',
    'auth.resetPassword.error.unauthorized': 'Gültiges temporäres Token erforderlich.',
    'auth.resetPassword.error.invalidToken': 'Ungültiges oder abgelaufenes Token. Bitte OTP-Verifizierung erneut durchführen.',
    'auth.resetPassword.error.fieldsRequired': 'Neues Passwort und Bestätigung sind erforderlich.',
    'auth.resetPassword.error.passwordMismatch': 'Passwörter stimmen nicht überein.',
    'auth.resetPassword.error.passwordTooShort': 'Passwort muss mindestens 6 Zeichen haben.',
    'auth.resetPassword.error.failed': 'Passwort-Zurücksetzung fehlgeschlagen.',
    'auth.changePassword.success': 'Passwort erfolgreich geändert.',
    'auth.changePassword.error.currentPasswordRequired': 'Aktuelles Passwort ist erforderlich.',
    'auth.changePassword.error.currentPasswordWrong': 'Aktuelles Passwort ist falsch.',

    // Mood messages
    'mood.get.success': 'Stimmungen erfolgreich abgerufen.',
    'mood.scale.get.success': 'Stimmungsskala erfolgreich abgerufen.',
    'mood.scale.item.get.success': 'Stimmungsskala erfolgreich abgerufen.',
    'mood.create.success': 'Stimmung erfolgreich erstellt.',
    'mood.update.success': 'Stimmung erfolgreich aktualisiert.',
    'mood.delete.success': 'Stimmung erfolgreich gelöscht.',
    'mood.error.keyRequired': 'Schlüssel ist erforderlich',
    'mood.error.labelRequired': 'Bezeichnung ist erforderlich',
    'mood.error.allowedTonesRequired': 'allowedTones muss ein Array von Strings sein',
    'mood.error.keyExists': 'Stimmung mit Schlüssel "{key}" existiert bereits.',
    'mood.error.idRequired': 'Stimmungs-ID ist erforderlich',
    'mood.error.notFound': 'Stimmung nicht gefunden',
    'mood.error.keyInvalid': 'Schlüssel muss ein nicht leeres Zeichenfolge sein',
    'mood.error.labelInvalid': 'Bezeichnung muss ein nicht leeres Zeichenfolge sein',
    'mood.seed.success': 'Stimmungsskala erfolgreich eingespielt.',
    'mood.seed.error.fileNotFound': 'Die Datei mit den Stimmungsdaten wurde nicht gefunden.',
    'mood.seed.error.readFailed': 'Die Datei mit den Stimmungsdaten konnte nicht gelesen werden.',
    'mood.seed.error.invalidJson': 'Die Stimmungsdaten-Datei enthält kein gültiges JSON.',
    'mood.seed.error.invalidFormat': 'Die Stimmungsdaten müssen ein JSON-Array sein.',

    // Companion messages
    'companion.get.success': 'Begleiter erfolgreich abgerufen.',
    'companion.create.success': 'Begleiter erfolgreich erstellt.',
    'companion.update.success': 'Begleiter erfolgreich aktualisiert.',
    'companion.error.alreadyExists': 'Ein Begleiter existiert bereits für diesen Benutzer.',
    'companion.error.notFound': 'Begleiter nicht gefunden.',
    'companion.error.nameRequired': 'Name ist erforderlich.',
    'companion.error.genderRequired': 'Geschlecht ist erforderlich.',
    'companion.error.invalidGender': 'Ungültiges Geschlecht. Verwenden Sie male, female oder neutral.',
    'companion.error.toneRequired': 'Ton ist erforderlich.',
    'companion.error.invalidTone': 'Ungültiger Ton. Verwenden Sie calm, warm, playful, caring oder flirty_soft.',

    // User mood messages
    'userMood.set.success': 'Stimmung erfolgreich aktualisiert.',
    'userMood.get.success': 'Stimmung erfolgreich abgerufen.',
    'userMood.error.moodIdRequired': 'Stimmungs-ID ist erforderlich.',
    'userMood.error.moodNotFound': 'Stimmung nicht gefunden.',
    'userMood.error.notSet': 'Keine Stimmung ausgewählt.',

    // Chat messages
    'chat.create.success': 'Chat erfolgreich erstellt.',
    'chat.list.success': 'Chats erfolgreich abgerufen.',
    'chat.get.success': 'Chat erfolgreich abgerufen.',
    'chat.delete.success': 'Chat erfolgreich gelöscht.',
    'chat.messages.get.success': 'Nachrichten erfolgreich abgerufen.',
    'chat.message.send.success': 'Nachricht erfolgreich gesendet.',
    'chat.message.error.contentRequired': 'Nachrichteninhalt ist erforderlich.',
    'chat.start.success': 'Chat-Start bestätigt.',
    'chat.start.error.moodScaleIdRequired': 'Stimmungsskalen-ID ist erforderlich.',
    'chat.start.error.moodScaleNotFound': 'Stimmungsskalen-Eintrag nicht gefunden.',
    'chat.start.error.moodPromptMissing': 'Für diese Stimmungsskala fehlt der Prompt-Text in Ihrer Sprache.',
    'chat.mood.message.error.notMoodChat': 'Dieser Chat ist kein Stimmungskontext-Chat.',
    'chat.mood.message.error.moodContextMissing': 'Der Stimmungskontext für diesen Chat wurde nicht gefunden.'
  }
};

// List of supported language codes
const supportedLanguages = Object.keys(messages);

/**
 * Resolve language from Accept-Language header with fallback logic
 * @param {string} acceptLanguage - Accept-Language header value
 * @returns {string} - Resolved language code (default from env)
 */
const resolveLanguage = (acceptLanguage) => {
  if (!acceptLanguage || acceptLanguage.trim() === '') {
    return getDefaultLanguage();
  }

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,de;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const parts = lang.trim().split(';');
      const code = parts[0].trim().toLowerCase();
      const quality = parts[1] ? parseFloat(parts[1].split('=')[1]) : 1.0;
      return { code, quality };
    })
    .sort((a, b) => b.quality - a.quality); // Sort by quality (preference)

  // Try to find first supported language
  for (const lang of languages) {
    // Check exact match (e.g., "en")
    if (supportedLanguages.includes(lang.code)) {
      return lang.code;
    }
    // Check primary language code (e.g., "en" from "en-US")
    const primaryCode = lang.code.split('-')[0];
    if (supportedLanguages.includes(primaryCode)) {
      return primaryCode;
    }
  }

  return getDefaultLanguage();
};

/**
 * Get localized message by key
 * @param {string} key - Message key
 * @param {string} language - Language code
 * @returns {string|null} - Localized message or null if not found
 */
const getLocalizedMessage = (key, language) => {
  const lang = language || getDefaultLanguage();
  const resolvedLanguage = supportedLanguages.includes(lang) ? lang : getDefaultLanguage();
  
  // Try to get message in requested language
  if (messages[resolvedLanguage] && messages[resolvedLanguage][key]) {
    return messages[resolvedLanguage][key];
  }
  
  const defaultLang = getDefaultLanguage();
  if (messages[defaultLang] && messages[defaultLang][key]) {
    return messages[defaultLang][key];
  }
  
  // Return null if message not found at all
  return null;
};

/**
 * Get localized message from request object
 * @param {string} key - Message key
 * @param {object} req - Express request object (must have req.language or req.headers['accept-language'])
 * @returns {string|null} - Localized message or null if not found
 */
const getLocalizedMessageFromRequest = (key, req) => {
  // Use req.language if set by middleware, otherwise resolve from header
  const language = req.language || resolveLanguage(req.headers['accept-language']);
  
  return getLocalizedMessage(key, language);
};

/**
 * Get localized error message
 * @param {string} key - Error message key
 * @param {string} language - Language code
 * @returns {string} - Localized error message (always returns a string, never null)
 */
const getLocalizedErrorMessage = (key, language) => {
  const message = getLocalizedMessage(key, language || getDefaultLanguage());
  // Always return a string, use key as fallback if message not found
  return message || key;
};

module.exports = {
  getDefaultLanguage,
  getLocalizedMessageFromRequest,
  getLocalizedMessage,
  getLocalizedErrorMessage,
  resolveLanguage,
  supportedLanguages,
  messages
};
