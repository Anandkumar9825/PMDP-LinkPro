const express = require('express');
const router = express.Router();
const Authentication = require('../authentication/auth');
const PostController = require('../controller/post');
const CommentController = require('../controller/comment');

router.post('/', Authentication.auth, PostController.addPost);
router.post('/likeDislike', Authentication.auth, PostController.likeDislikePost);
router.post('/share/:postId', Authentication.auth, PostController.sharePost);
router.get('/getAllPost', Authentication.optionalAuth, PostController.getAllPost);
router.get('/getPostById/:postId', PostController.getPostByPostId);
router.get('/getTop5Post/:userId', Authentication.optionalAuth, PostController.getTop5PostForUser);
router.get('/getAllPostForUser/:userId', Authentication.optionalAuth, PostController.getAllPostForUser);
router.put('/:postId', Authentication.auth, PostController.updatePost);
router.delete('/:postId', Authentication.auth, PostController.deletePost);
router.delete('/:postId/comments/:commentId', Authentication.auth, CommentController.deleteComment);

router.post('/save/:postId', Authentication.auth, PostController.toggleSavePost);
router.get('/saved/me', Authentication.auth, PostController.getSavedPosts);

// Post Mentions & Tagged Profile Routes
router.put('/:postId/mention/respond', Authentication.auth, PostController.respondToMention);
router.get('/tagged/:userId', Authentication.optionalAuth, PostController.getTaggedPostsForUser);

module.exports = router;