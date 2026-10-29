const express = require('express');
const router = express.Router();
const Authentication = require('../authentication/auth');
const MessageController = require('../controller/message');

router.post('/', Authentication.auth, MessageController.sendMessage);
router.get('/unread-total', Authentication.auth, MessageController.getTotalUnreadCount);
router.get('/:convId', Authentication.auth, MessageController.getMessage);
router.put('/read/:convId', Authentication.auth, MessageController.markAsRead);
router.delete('/delete-for-me/:messageId', Authentication.auth, MessageController.deleteMessageForMe);
router.delete('/delete-for-everyone/:messageId', Authentication.auth, MessageController.deleteMessageForEveryone);
router.delete('/clear-chat/:convId', Authentication.auth, MessageController.clearChat);

module.exports = router;