const freeChatService = require('../services/freeChatService');
const { getLocalizedMessageFromRequest } = require('../utils/localization');

/**
 * List free chats for logged-in user
 * @route   GET /api/freeChat
 * @access  Private
 */
const getUserChats = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const chats = await freeChatService.getUserFreeChats(userId);

    const message = getLocalizedMessageFromRequest('chat.list.success', req) || 'Chats retrieved successfully.';
    res.status(200).json({
      success: true,
      message,
      data: { chats }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get free chat by id
 * @route   GET /api/freeChat/:chatId
 * @access  Private
 */
const getChatById = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;

    const chat = await freeChatService.getChatById(chatId, userId);

    const message = getLocalizedMessageFromRequest('chat.get.success', req) || 'Chat retrieved successfully.';
    res.status(200).json({
      success: true,
      message,
      data: { chat }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete free chat
 * @route   DELETE /api/freeChat/:chatId
 * @access  Private
 */
const deleteChat = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;

    await freeChatService.deleteChat(chatId, userId);

    const message = getLocalizedMessageFromRequest('chat.delete.success', req) || 'Chat deleted successfully.';
    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated messages for a free chat
 * @route   GET /api/freeChat/:chatId/messages
 * @access  Private
 */
const getChatMessages = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 30;

    const result = await freeChatService.getChatMessages(chatId, userId, page, limit);

    const message = getLocalizedMessageFromRequest('chat.messages.get.success', req) || 'Messages retrieved successfully.';
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
 * Send a free chat message (body: { chatId?, message })
 * @route   POST /api/freeChat/messages
 * @access  Private
 */
const sendFreeChatMessage = async (req, res, next) => {
  try {
    let isFreeChatCreated = false;

    let { chatId, message: bodyMessage } = req.body;

    if (!bodyMessage || !bodyMessage.trim()) {
      const msg = getLocalizedMessageFromRequest('chat.message.error.contentRequired', req) || 'Message content is required.';
      return res.status(400).json({
        success: false,
        message: msg
      });
    }

    const userId = req.user?.userId;

    if (chatId == null || chatId === '') {
      const chat = await freeChatService.createFreeChat(userId);
      chatId = chat._id;

      isFreeChatCreated = true;
    }

    const result = await freeChatService.sendChatMessage(chatId, userId, bodyMessage.trim());

    const message = getLocalizedMessageFromRequest('chat.message.send.success', req) || 'Message sent successfully.';
    res.status(200).json({
      success: true,
      message,
      data: {
        chatId: String(chatId),
        ...result
      }
    });

    if (isFreeChatCreated) {
      freeChatService.pruneExcessFreeChatsForUser(userId);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserChats,
  getChatById,
  deleteChat,
  getChatMessages,
  sendFreeChatMessage
};
