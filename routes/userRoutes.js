const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getProfile, updateProfile, uploadProfileImage, getProfileImage, updateLanguage, getLanguage, deleteAccount } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.post('/profile-image', protect, upload.single('image'), uploadProfileImage);
router.get('/profile-image', protect, getProfileImage);
router.patch('/language', protect, updateLanguage);
router.get('/language', protect, getLanguage);
router.delete('/account', protect, deleteAccount);

module.exports = router;
