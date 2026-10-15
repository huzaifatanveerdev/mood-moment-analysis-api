const express = require('express');
const { protect } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const {
  getMoods,
  getAllMoodScale,
  getMoodScale,
  addMood,
  updateMood,
  deleteMood,
  seedMoodScale
} = require('../controllers/moodController');

const router = express.Router();

router.get('/', protect, getMoods);
router.get('/mood-scale', protect, getMoodScale);
router.get('/mood-scale-all', protect, requireAdmin, getAllMoodScale);
router.post('/seed/mood-scale', protect, requireAdmin, seedMoodScale);
router.post('/', protect, requireAdmin, addMood);
router.patch('/:id', protect, requireAdmin, updateMood);
router.delete('/:id', protect, requireAdmin, deleteMood);

module.exports = router;
