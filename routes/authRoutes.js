const express = require('express');
const { protect } = require('../middleware/auth');
const { requestOtp, verifyOtp, register, login, requestPasswordResetOtp, verifyPasswordResetOtp, resetPassword, changePassword } = require('../controllers/authController');

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', requestPasswordResetOtp);
router.post('/verify-reset-otp', verifyPasswordResetOtp);
router.post('/reset-password', resetPassword);
router.patch('/change-password', protect, changePassword);

module.exports = router;
