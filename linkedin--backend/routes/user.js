const express = require('express');
const router = express.Router();
const UserController = require('../controller/user');
const Authentication = require('../authentication/auth');

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/google', UserController.loginThroughGmail);

router.get('/self', Authentication.auth, (req, res) => {
    return res.status(200).json({
        user: req.user
    });
});

router.put('/update', Authentication.auth, UserController.updateUser);
router.get('/user/:id', Authentication.optionalAuth, UserController.getProfileById);
router.post('/logout', Authentication.auth, UserController.logout);
router.get('/findUser', Authentication.auth, UserController.findUser);

// Profile Experience CRUD Routes
router.post('/experience', Authentication.auth, UserController.addExperience);
router.put('/experience/:expId', Authentication.auth, UserController.editExperience);
router.delete('/experience/:expId', Authentication.auth, UserController.deleteExperience);

// Network Discover Suggestions Routes
router.get('/discover', Authentication.auth, UserController.getDiscoverSuggestions);
router.get('/suggestions', Authentication.auth, UserController.getDiscoverSuggestions);

// Account Deletion Routes with 2-Step OTP Verification
router.post('/request-delete-otp', Authentication.auth, UserController.requestDeleteAccountOtp);
router.post('/verify-delete-account', Authentication.auth, UserController.verifyDeleteAccountOtp);

// Connection & Friend Request Routes
router.post('/sendFriendReq', Authentication.auth, UserController.sendFriendRequest);
router.post('/acceptFriendRequest', Authentication.auth, UserController.acceptFriendRequest);
router.post('/declineFriendRequest', Authentication.auth, UserController.declineFriendRequest);
router.post('/revokeFriendRequest', Authentication.auth, UserController.revokeFriendRequest);
router.get('/friendsList', Authentication.auth, UserController.getFriendsList);
router.get('/pendingFriendsList', Authentication.auth, UserController.getPendingFriendsList);
router.get('/sentFriendsList', Authentication.auth, UserController.getSentFriendsList);
router.delete('/removeFromFriendList/:friendId', Authentication.auth, UserController.removeFromFriend);

router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.post('/reset-password/:token', UserController.resetPassword);
router.post('/change-password', Authentication.auth, UserController.changePassword);

module.exports = router;