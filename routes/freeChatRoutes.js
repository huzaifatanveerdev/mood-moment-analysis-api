const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getUserChats,
  getChatById,
  deleteChat,
  getChatMessages,
  sendFreeChatMessage
} = require('../controllers/freeChatController');

const router = express.Router();

router.get('/', protect, getUserChats);
router.post('/messages', protect, sendFreeChatMessage);
router.get('/:chatId/messages', protect, getChatMessages);
router.get('/:chatId', protect, getChatById);
router.delete('/:chatId', protect, deleteChat);

module.exports = router;
