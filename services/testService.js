// Test service
const { getLocalizedMessage, getDefaultLanguage } = require('../utils/localization');

/**
 * Get hello message
 * @param {string} language - Language code
 * @returns {Promise<object>} - Service result
 */
const getHelloMessage = async (language = getDefaultLanguage()) => {
  const message = getLocalizedMessage('test.hello.message', language) || 'Hello. This project is up and running.';

  return {
    message
  };
};

module.exports = {
  getHelloMessage
};
