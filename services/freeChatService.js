const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const ChatMood = require('../models/ChatMood');
const User = require('../models/User');
const { sendMessage } = require('./openRouterService');
const {
  getOrCreateMemory,
  extractAndUpdateMemory,
  extractJobFromFreeChatIfDiscussed,
  buildSystemPromptForFreeChat
} = require('./userMemoryService');
const { AppError } = require('../utils/errors');

const CHAT_HISTORY_LIMIT = parseInt(process.env.CHAT_HISTORY_LIMIT, 10) || 20;
const FREE_CHAT_RETENTION_LIMIT = parseInt(process.env.FREE_CHAT_RETENTION_LIMIT, 10) || 3;

const extractFromPreviousChatIfNeeded = async (userId) => {
  const previousChat = await Chat.findOne({ userId }).sort({ updatedAt: -1 });
  if (previousChat && previousChat.unprocessedMessageCount > 0) {
    if (previousChat.isFreeChat === true) {
      extractJobFromFreeChatIfDiscussed(userId, previousChat._id);
    } else {
      extractAndUpdateMemory(userId, previousChat._id);
    }
  }
};

const createFreeChat = async (userId) => {
  await extractFromPreviousChatIfNeeded(userId);
  const chat = await Chat.create({ userId, isFreeChat: true });
  return chat;
};

/**
 * Keeps at most FREE_CHAT_RETENTION_LIMIT free chats per user; deletes oldest free chats only.
 * Safe to call without await (background); errors are logged, not thrown.
 */
const pruneExcessFreeChatsForUser = async (userId) => {
  try {
    const freeChats = await Chat.find({ userId, isFreeChat: true })
      .sort({ createdAt: 1 })
      .select('_id')
      .lean();

    if (freeChats.length <= FREE_CHAT_RETENTION_LIMIT) return;

    const toDelete = freeChats.slice(0, freeChats.length - FREE_CHAT_RETENTION_LIMIT);
    const ids = toDelete.map((c) => c._id);

    await ChatMessage.deleteMany({ chatId: { $in: ids } });
    await Chat.deleteMany({ _id: { $in: ids }, userId, isFreeChat: true });
  } catch (err) {
    console.error('pruneExcessFreeChatsForUser failed:', err.message);
  }
};

const getUserFreeChats = async (userId) => {
  const chats = await Chat.find({ userId, isFreeChat: true }).sort({ updatedAt: -1 });
  return chats;
};

const getChatById = async (chatId, userId) => {
  const chat = await Chat.findOne({ _id: chatId, userId, isFreeChat: true });
  if (!chat) throw new AppError('Chat not found', 404);
  return chat;
};

const deleteChat = async (chatId, userId) => {
  const chat = await Chat.findOne({ _id: chatId, userId, isFreeChat: true });
  if (!chat) throw new AppError('Chat not found', 404);
  await ChatMessage.deleteMany({ chatId });
  await ChatMood.deleteMany({ chatId });
  await Chat.findByIdAndDelete(chatId);
};

const getChatMessages = async (chatId, userId, page = 1, limit = 30) => {
  const chat = await Chat.findOne({ _id: chatId, userId, isFreeChat: true });
  if (!chat) throw new AppError('Chat not found', 404);

  const skip = (page - 1) * limit;
  const total = await ChatMessage.countDocuments({ chatId });

  const messages = await ChatMessage.find({ chatId })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  return {
    messages,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const sendChatMessage = async (chatId, userId, userContent) => {
  const chat = await Chat.findOne({ _id: chatId, userId, isFreeChat: true });
  if (!chat) throw new AppError('Chat not found', 404);

  const recentMessages = await ChatMessage.find({ chatId })
    .sort({ createdAt: -1 })
    .limit(CHAT_HISTORY_LIMIT)
    .lean();

  const historyForAI = recentMessages
    .reverse()
    .map(({ role, content }) => ({ role, content }));

  const user = await User.findById(userId).lean();
  const memory = await getOrCreateMemory(userId);
  const systemPrompt = buildSystemPromptForFreeChat(user, memory);

  historyForAI.unshift({ role: 'system', content: systemPrompt });
  historyForAI.push({ role: 'user', content: userContent });

  const assistantReply = await sendMessage(historyForAI);

  await ChatMessage.insertMany([
    { chatId, userId, role: 'user', content: userContent },
    { chatId, userId, role: 'assistant', content: assistantReply }
  ]);

  if (!chat.title) {
    const title = userContent.slice(0, 60);
    await Chat.findByIdAndUpdate(chatId, { title });
  }

  await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

  const newUnprocessedCount = (chat.unprocessedMessageCount || 0) + 2;
  await Chat.findByIdAndUpdate(chatId, { unprocessedMessageCount: newUnprocessedCount });

  if (newUnprocessedCount >= 6) {
    extractJobFromFreeChatIfDiscussed(userId, chatId);
  }

  return { userContent, assistantReply };
};

module.exports = {
  createFreeChat,
  pruneExcessFreeChatsForUser,
  getUserFreeChats,
  getChatById,
  deleteChat,
  getChatMessages,
  sendChatMessage
};
