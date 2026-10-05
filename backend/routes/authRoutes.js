const express = require('express');

const authController = require('../controllers/authController');

const protect = require('../middleware/authMiddleware');

const authorize = require('../middleware/roleMiddleware');

const uploadAvatar = require('../middleware/uploadMiddleware');

const router = express.Router();

// USERS

router.post('/createUser', authController.createUser);

router.post('/verifyEmail', authController.verifyEmail);

router.post('/resendVerificationCode', authController.resendVerificationCode);

router.post('/loginUser', authController.loginUser);

router.get('/getUser', protect, authController.getUser);

router.get('/getAllUsers', protect, authorize('ADMIN'), authController.getAllUsers);

router.patch('/updateUser', protect, authController.updateUser);

router.patch('/uploadAvatar', protect, uploadAvatar.single('avatar'), authController.uploadAvatar);

router.patch('/changePassword', protect, authController.changePassword);

router.patch('/deactivateAccount', protect, authorize('USER'), authController.deactivateAccount);

router.patch('/deactivateUser/:id', protect, authorize('ADMIN'), authController.deactivateUser);

router.patch('/activateUser/:id', protect, authorize('ADMIN'), authController.activateUser);

module.exports = router;