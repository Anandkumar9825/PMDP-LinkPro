const express = require('express');
const router = express.Router();
const Authentication = require('../authentication/auth');
const CommentController = require('../controller/comment');

router.post('/', Authentication.auth, CommentController.commentPost);
router.post('/likeDislike', Authentication.auth, CommentController.likeDislikeComment);
router.get('/:postId', CommentController.getCommentByPostId);
router.delete('/:commentId', Authentication.auth, CommentController.deleteComment);

module.exports = router;