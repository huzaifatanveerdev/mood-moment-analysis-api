const { getLocalizedMessageFromRequest, getDefaultLanguage } = require('../utils/localization');
const testService = require('../services/testService');

/**
 * Say hello endpoint
 * @route   GET /api/test/say-hello
 * @access  Public
 */
const sayHello = async (req, res, next) => {
  try {
    const language = req.language || getDefaultLanguage();

    const result = await testService.getHelloMessage(language);

    const successMessage = getLocalizedMessageFromRequest('test.hello.success', req) || 'Hello. This project is up and running.';

    res.status(200).json({
      success: true,
      message: successMessage,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sayHello
};
