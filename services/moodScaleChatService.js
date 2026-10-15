const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const ChatMood = require('../models/ChatMood');
const User = require('../models/User');
const MoodScale = require('../models/MoodScale');
const Companion = require('../models/Companion');
const { sendMessage } = require('./openRouterService');
const {
  getOrCreateMemory,
  extractAndUpdateMemory,
  extractJobFromFreeChatIfDiscussed,
  buildMoodScaleSystemPrompt
} = require('./userMemoryService');
const { AppError } = require('../utils/errors');
const {
  getLocalizedMessage,
  getDefaultLanguage,
  supportedLanguages
} = require('../utils/localization');

const CHAT_HISTORY_LIMIT = parseInt(process.env.CHAT_HISTORY_LIMIT, 10) || 20;

const resolveRequestLanguage = (language) =>
  supportedLanguages.includes(language) ? language : getDefaultLanguage();

const localizeMoodScaleDoc = (doc, language) => {
  const lang = resolveRequestLanguage(language);
  const isDe = lang === 'de';
  return {
    _id: doc._id,
    key: doc.key,
    scale: doc.scale,
    label: isDe ? doc.labelDe || doc.labelEn : doc.labelEn,
    prompt: isDe ? doc.promptDe || doc.promptEn : doc.promptEn,
    feeling: isDe ? doc.feelingDe || doc.feelingEn : doc.feelingEn,
    style: isDe ? doc.styleDe || doc.styleEn : doc.styleEn,
    responseHint: isDe ? doc.responseHintDe || doc.responseHintEn : doc.responseHintEn
  };
};

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

const persistChatMoodSnapshot = async (userId, chatId, moodScaleDocLean) => {
  await ChatMood.create({
    chatId,
    userId,
    moodScaleId: moodScaleDocLean._id,
    key: moodScaleDocLean.key,
    scale: moodScaleDocLean.scale,
    labelEn: moodScaleDocLean.labelEn,
    labelDe: moodScaleDocLean.labelDe,
    promptEn: moodScaleDocLean.promptEn,
    promptDe: moodScaleDocLean.promptDe,
    feelingEn: moodScaleDocLean.feelingEn,
    feelingDe: moodScaleDocLean.feelingDe,
    styleEn: moodScaleDocLean.styleEn,
    styleDe: moodScaleDocLean.styleDe,
    responseHintEn: moodScaleDocLean.responseHintEn,
    responseHintDe: moodScaleDocLean.responseHintDe
  });
};

const moodDocFromChatMoodLean = (chatMood) => ({
  key: chatMood.key,
  labelEn: chatMood.labelEn,
  labelDe: chatMood.labelDe,
  promptEn: chatMood.promptEn,
  promptDe: chatMood.promptDe,
  feelingEn: chatMood.feelingEn,
  feelingDe: chatMood.feelingDe,
  styleEn: chatMood.styleEn,
  styleDe: chatMood.styleDe,
  responseHintEn: chatMood.responseHintEn,
  responseHintDe: chatMood.responseHintDe
});

const createMoodScaleChat = async (userId) => {
  await extractFromPreviousChatIfNeeded(userId);
  const chat = await Chat.create({ userId, isFreeChat: false, isMoodScaleChat: true });
  return chat;
};

/**
 * Validates mood scale, creates a mood-scale chat, sends first AI turn with full mood system prompt.
 * Persists the visible user line as promptEn or promptDe only (same as stored message content).
 */
const startMoodScaleChatSession = async (userId, moodScaleId, language = getDefaultLanguage()) => {
  const lang = resolveRequestLanguage(language);

  if (moodScaleId == null || (typeof moodScaleId === 'string' && !String(moodScaleId).trim())) {
    const message =
      getLocalizedMessage('chat.start.error.moodScaleIdRequired', lang) || 'Mood scale id is required.';
    throw new AppError(message, 400);
  }

  if (!mongoose.isValidObjectId(String(moodScaleId))) {
    const message =
      getLocalizedMessage('chat.start.error.moodScaleNotFound', lang) || 'Mood scale not found.';
    throw new AppError(message, 404);
  }

  const doc = await MoodScale.findOne({ _id: moodScaleId, isActive: true }).lean();
  if (!doc) {
    const message =
      getLocalizedMessage('chat.start.error.moodScaleNotFound', lang) || 'Mood scale not found.';
    throw new AppError(message, 404);
  }

  const userContent =
    lang === 'de'
      ? String(doc.promptDe || doc.promptEn || '').trim()
      : String(doc.promptEn || doc.promptDe || '').trim();

  if (!userContent) {
    const message =
      getLocalizedMessage('chat.start.error.moodPromptMissing', lang) ||
      'This mood scale has no prompt text for your language.';
    throw new AppError(message, 400);
  }

  const moodScale = localizeMoodScaleDoc(doc, lang);

  const chat = await createMoodScaleChat(userId);
  const chatId = chat._id;

  await persistChatMoodSnapshot(userId, chatId, doc);

  const memory = await getOrCreateMemory(userId);
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError('User not found', 404);
  }
  const companion = await Companion.findOne({ userId }).select('name gender').lean();

  const systemPrompt = buildMoodScaleSystemPrompt(user, memory, doc, lang, companion);

  const historyForAI = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  const assistantReply = await sendMessage(historyForAI);

  await ChatMessage.insertMany([
    { chatId, userId, role: 'user', content: userContent },
    { chatId, userId, role: 'assistant', content: assistantReply }
  ]);

  const title = userContent.slice(0, 60);
  await Chat.findByIdAndUpdate(chatId, { title, updatedAt: new Date() });

  const newUnprocessedCount = (chat.unprocessedMessageCount || 0) + 2;
  await Chat.findByIdAndUpdate(chatId, { unprocessedMessageCount: newUnprocessedCount });

  if (newUnprocessedCount >= 10) {
    extractAndUpdateMemory(userId, chatId);
  }

  return {
    chatId: String(chatId),
    userContent,
    assistantReply,
    moodScale
  };
};

/**
 * Send a follow-up message in a mood-scale chat using cached mood context and full memory pipeline.
 */
const sendMoodScaleChatMessage = async (chatId, userId, userContent, language = getDefaultLanguage()) => {
  const lang = resolveRequestLanguage(language);

  if (userContent == null || !String(userContent).trim()) {
    const message =
      getLocalizedMessage('chat.message.error.contentRequired', lang) || 'Message content is required.';
    throw new AppError(message, 400);
  }

  const trimmed = String(userContent).trim();

  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat) throw new AppError('Chat not found', 404);

  if (!chat.isMoodScaleChat) {
    const message =
      getLocalizedMessage('chat.mood.message.error.notMoodChat', lang) ||
      'This chat is not a mood-scale conversation.';
    throw new AppError(message, 400);
  }

  const chatMood = await ChatMood.findOne({ chatId, userId }).lean();
  if (!chatMood) {
    const message =
      getLocalizedMessage('chat.mood.message.error.moodContextMissing', lang) ||
      'Mood context for this chat was not found.';
    throw new AppError(message, 404);
  }

  const memory = await getOrCreateMemory(userId);

  const recentMessages = await ChatMessage.find({ chatId })
    .sort({ createdAt: -1 })
    .limit(CHAT_HISTORY_LIMIT)
    .lean();

  const historyForAI = recentMessages
    .reverse()
    .map(({ role, content }) => ({ role, content }));

  const user = await User.findById(userId).lean();
  if (!user) throw new AppError('User not found', 404);
  const companion = await Companion.findOne({ userId }).select('name gender').lean();

  const moodDoc = moodDocFromChatMoodLean(chatMood);
  const systemPrompt = buildMoodScaleSystemPrompt(user, memory, moodDoc, lang, companion);

  historyForAI.unshift({ role: 'system', content: systemPrompt });
  historyForAI.push({ role: 'user', content: trimmed });

  const assistantReply = await sendMessage(historyForAI);

  await ChatMessage.insertMany([
    { chatId, userId, role: 'user', content: trimmed },
    { chatId, userId, role: 'assistant', content: assistantReply }
  ]);

  if (!chat.title) {
    const title = trimmed.slice(0, 60);
    await Chat.findByIdAndUpdate(chatId, { title });
  }

  await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

  const newUnprocessedCount = (chat.unprocessedMessageCount || 0) + 2;
  await Chat.findByIdAndUpdate(chatId, { unprocessedMessageCount: newUnprocessedCount });

  if (newUnprocessedCount >= 10) {
    extractAndUpdateMemory(userId, chatId);
  }

  return { userContent: trimmed, assistantReply };
};

module.exports = {
  startMoodScaleChatSession,
  sendMoodScaleChatMessage
};
