const express = require('express');
const { protect } = require('../middleware/auth');
const { getCompanion, createCompanion, updateCompanion, deleteCompanion } = require('../controllers/companionController');

const router = express.Router();

router.get('/', protect, getCompanion);
router.post('/', protect, createCompanion);
router.put('/', protect, updateCompanion);
router.delete('/', protect, deleteCompanion);

module.exports = router;
