const express = require('express');
const { protect } = require('../middleware/auth');
const { setUserMood, getUserMood } = require('../controllers/userMoodController');

const router = express.Router();

router.get('/', protect, getUserMood);
router.post('/', protect, setUserMood);

module.exports = router;
