const CommentModel = require("../models/comment");
const PostModel = require("../models/post");
const NotificationModal = require("../models/notification");

// Import Creational Design Pattern: Factory Method
const NotificationFactory = require("../patterns/creational/NotificationFactory");

// To Comment on Post.
exports.commentPost = async(req, res) => {
    try {
        const { postId, comment } = req.body;
        const userId = req.user._id;
        const postExist = await PostModel.findById(postId).populate("user");
        if(!postExist) {
            return res.status(400).json({ error: "No Such Post Found."});
        }

        postExist.comments = (postExist.comments || 0) + 1;
        await postExist.save();

        const newComment = new CommentModel({ user: userId, post: postId, comment, likes: [] });
        await newComment.save();

        const populatedComment = await CommentModel.findById(newComment._id).populate("user", "f_name headline profilePic");

        // Send notification to post author if not self
        if (postExist.user && !postExist.user._id.equals(userId)) {
            try {
                /**
                 * ============================================================
                 * CREATIONAL DESIGN PATTERN APPLIED: FACTORY METHOD PATTERN
                 * ============================================================
                 * 
                 * WHAT IS THIS PATTERN?
                 * --------------------
                 * The Factory Method defines an interface for creating an object,
                 * letting subclasses/creators decide which class to instantiate.
                 * 
                 * WHY ARE WE USING THIS PATTERN?
                 * ------------------------------
                 * - Delegates creation of comment notification to CommentNotificationCreator
                 *   via NotificationFactory.
                 * - Eliminates manual string concatenation and schema coupling.
                 * 
                 * WHERE ARE WE USING THIS PATTERN?
                 * --------------------------------
                 * - Here in controller/comment.js -> commentPost when notifying 
                 *   the post author of a new comment.
                 * ============================================================
                 */
                const notification = NotificationFactory.createNotification('comment', {
                    sender: userId,
                    reciever: postExist.user._id,
                    postId: postId.toString(),
                    commentId: newComment._id.toString(),
                    actorName: req.user.f_name
                });
                await notification.save();
            } catch (notifErr) {
                console.error("Comment notification error:", notifErr);
            }
        }

        return res.status(200).json({
            message: "Commented Successfully.",
            comment: populatedComment
        });

    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// To Like/Unlike a Comment with Dual Notification Trigger
exports.likeDislikeComment = async(req, res) => {
    try {
        const { commentId } = req.body;
        const selfId = req.user._id;

        const comment = await CommentModel.findById(commentId).populate("post");
        if (!comment) {
            return res.status(404).json({ error: "Comment not found." });
        }

        const index = comment.likes.findIndex(id => id.equals(selfId));
        const isLiking = index === -1;

        if (!isLiking) {
            comment.likes.splice(index, 1);
        } else {
            comment.likes.push(selfId);

            const commentAuthorId = comment.user;
            const postOwnerId = comment.post?.user;

            // 1. Dual Notification: Notify Comment Author (if not self)
            if (commentAuthorId && !commentAuthorId.equals(selfId)) {
                try {
                    /**
                     * CREATIONAL DESIGN PATTERN: FACTORY METHOD PATTERN
                     * Using NotificationFactory for comment author notification.
                     */
                    const notifToAuthor = NotificationFactory.createNotification('comment_like', {
                        sender: selfId,
                        reciever: commentAuthorId,
                        postId: comment.post?._id?.toString() || "",
                        commentId: comment._id.toString(),
                        actorName: req.user.f_name,
                        isPostOwner: false
                    });
                    await notifToAuthor.save();
                } catch (e) {}
            }

            // 2. Dual Notification: Notify Post Owner (if not self and not the comment author)
            if (
                postOwnerId &&
                !postOwnerId.equals(selfId) &&
                (!commentAuthorId || !postOwnerId.equals(commentAuthorId))
            ) {
                try {
                    /**
                     * CREATIONAL DESIGN PATTERN: FACTORY METHOD PATTERN
                     * Using NotificationFactory for post owner notification.
                     */
                    const notifToOwner = NotificationFactory.createNotification('comment_like', {
                        sender: selfId,
                        reciever: postOwnerId,
                        postId: comment.post?._id?.toString() || "",
                        commentId: comment._id.toString(),
                        actorName: req.user.f_name,
                        isPostOwner: true
                    });
                    await notifToOwner.save();
                } catch (e) {}
            }
        }

        await comment.save();

        return res.status(200).json({
            message: isLiking ? "Comment Liked" : "Comment Unliked",
            likes: comment.likes,
            likesCount: comment.likes.length
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// To Get Comments of Post.
exports.getCommentByPostId = async(req, res) => {
    try {
        const { postId } = req.params;
        const isPostExist = await PostModel.findById(postId);
        if(!isPostExist) {
            return res.status(400).json({ error: "No Such Post Found."});
        }

        const comments = await CommentModel.find({ post: postId })
            .sort({ createdAt: -1 })
            .populate("user", "f_name headline profilePic");

        return res.status(200).json({
            message: "Comments Fetched Successfully.",
            comments: comments
        });

    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// To Delete Comment
exports.deleteComment = async(req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await CommentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found." });
        }

        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized to delete this comment." });
        }

        await CommentModel.findByIdAndDelete(commentId);
        await PostModel.findByIdAndUpdate(comment.post, { $inc: { comments: -1 } });

        return res.status(200).json({ message: "Comment deleted successfully." });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};