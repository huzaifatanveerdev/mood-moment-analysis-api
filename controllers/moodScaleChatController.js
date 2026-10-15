const moodScaleChatService = require('../services/moodScaleChatService');
const { getLocalizedMessageFromRequest, getDefaultLanguage } = require('../utils/localization');

/**
 * Start a mood-scale chat: creates DB chat, first user line = mood prompt (en/de), full mood system prompt to AI.
 * @route   POST /api/moodscalechat/start
 * @access  Private
 * @body    { moodScaleId }
 */
const startChat = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();
    const { moodScaleId } = req.body;

    const result = await moodScaleChatService.startMoodScaleChatSession(userId, moodScaleId, language);

    const message = getLocalizedMessageFromRequest('chat.start.success', req) || 'Chat start acknowledged.';
    res.status(200).json({
      success: true,
      message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message in a mood-scale chat (cached mood context).
 * @route   POST /api/moodscalechat/messages
 * @access  Private
 * @body    { chatId, message }
 */
const sendMoodScaleChatMessage = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const language = req.language || getDefaultLanguage();
    const { chatId, message: bodyMessage } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'chatId is required.'
      });
    }

    if (!bodyMessage || !bodyMessage.trim()) {
      const msg =
        getLocalizedMessageFromRequest('chat.message.error.contentRequired', req) || 'Message content is required.';
      return res.status(400).json({
        success: false,
        message: msg
      });
    }

    const result = await moodScaleChatService.sendMoodScaleChatMessage(
      chatId,
      userId,
      bodyMessage.trim(),
      language
    );

    const message = getLocalizedMessageFromRequest('chat.message.send.success', req) || 'Message sent successfully.';
    res.status(200).json({
      success: true,
      message,
      data: {
        chatId: String(chatId),
        ...result
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startChat,
  sendMoodScaleChatMessage
};
