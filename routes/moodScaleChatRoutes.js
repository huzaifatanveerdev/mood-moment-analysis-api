const express = require('express');
const { protect } = require('../middleware/auth');
const { startChat, sendMoodScaleChatMessage } = require('../controllers/moodScaleChatController');

const router = express.Router();

router.post('/start', protect, startChat);
router.post('/messages', protect, sendMoodScaleChatMessage);

module.exports = router;
