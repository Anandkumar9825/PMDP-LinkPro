/**
 * ============================================================================
 * DESIGN PATTERN: FACADE PATTERN (Structural Pattern)
 * ============================================================================
 * 
 * OVERVIEW:
 * ---------
 * 1. Intent: Provide a unified, simplified interface to a complex set of 
 *    subsystems, making them much easier to use.
 * 2. Why We Use It: Complex operations (like creating or liking a post) involve 
 *    many moving parts: text sanitizers (Decorators), post builders, database 
 *    queries, and notification factories. Putting all this coordination directly 
 *    inside controllers results in bloated, tightly coupled code.
 * 3. How It Works: 
 *    - `PostFacade` exposes simple, high-level methods (`createPost`, `toggleLike`).
 *    - It orchestrates all the underlying patterns and subsystems behind the scenes 
 *      so the controller doesn't have to worry about them.
 * 
 * FILE LOCATION:
 * --------------
 * - Pattern: `linkedin--backend/patterns/structural/PostFacade.js`
 * - Usage: `linkedin--backend/controller/post.js` (inside `addPost` and `likeDislikePost`)
 * ============================================================================
 */

const PostModel = require('../../models/post');
const PostBuilder = require('../creational/PostBuilder');
const NotificationFactory = require('../creational/NotificationFactory');
const {
    BasePostContent,
    ContentSanitizerDecorator,
    HashtagExtractorDecorator
} = require('./PostDecorator');
const { globalNotificationSubject } = require('../behavioral/NotificationObserver');

class PostFacade {
    /**
     * Facade method to coordinate creating, decorating, and persisting a Post.
     * 
     * Orchestrates:
     * 1. Decorator Subsystem: Sanitizes description & extracts embedded hashtags.
     * 2. Builder Subsystem: Assembles PostModel with validated parameters.
     * 3. Persistence Subsystem: Saves document and populates author information.
     * 
     * @param {object} params
     * @param {string} params.userId - Author user ID
     * @param {string} params.desc - Post text
     * @param {string} params.imageLink - Image URL (optional)
     * @param {Array<string>} params.tags - Explicit tags array (optional)
     * @returns {Promise<object>} The populated saved post document
     */
    static async createPost({ userId, desc, imageLink, tags, mentions, actorName }) {
        // 1. Decorator Subsystem: Dynamically decorate and sanitize content
        let contentComponent = new BasePostContent({ desc, imageLink, tags });
        contentComponent = new ContentSanitizerDecorator(contentComponent);
        contentComponent = new HashtagExtractorDecorator(contentComponent);
        const enrichedPayload = contentComponent.getPayload();

        // 2. Builder Subsystem: Step-by-step construction
                // Process and normalize mentions
        let formattedMentions = [];
        if (Array.isArray(mentions)) {
            formattedMentions = mentions
                .map(m => (typeof m === 'object' && m?.user ? m.user : m))
                .filter(Boolean)
                .map(uId => ({ user: uId, status: 'pending' }));
        }

        const newPost = new PostBuilder()
            .setUser(userId)
            .setDescription(enrichedPayload.desc)
            .setImage(enrichedPayload.imageLink)
            .setTags(enrichedPayload.tags)
            .setMentions(formattedMentions)
            .setShares(0)
            .build();

        // 3. Database Subsystem: Persist and populate author
        await newPost.save();
        // Dispatch notifications for mentioned friends via Factory Method
        for (const m of formattedMentions) {
            if (m.user && m.user.toString() !== userId.toString()) {
                try {
                    const notification = NotificationFactory.createNotification('mention', {
                        sender: userId,
                        reciever: m.user,
                        postId: newPost._id.toString(),
                        actorName: actorName || 'Someone'
                    });
                    await notification.save();

                    // Notify Observers
                    globalNotificationSubject.notify({
                        type: 'POST_MENTION',
                        actorId: userId,
                        targetId: m.user,
                        notification
                    });
                } catch (notifErr) {
                    console.error('[PostFacade] Mention notification error:', notifErr);
                }
            }
        }

        const populatedPost = await PostModel.findById(newPost._id)
            .populate("user", "-password")
            .populate("mentions.user", "f_name headline profilePic");

        return populatedPost;
    }

    /**
     * Facade method to coordinate toggling a like on a post.
     * 
     * Orchestrates:
     * 1. Query post and author
     * 2. Toggle user in likes array
     * 3. Factory Subsystem: Create like notification if liking another user's post
     * 4. Persistence Subsystem: Save post & notification
     * 
     * @param {object} params
     * @param {object} params.selfUser - Logged in user object ({ _id, f_name })
     * @param {string} params.postId - ID of the post to like/unlike
     * @returns {Promise<object>} Result payload { post, isLiked, likesCount }
     */
    static async toggleLike({ selfUser, postId }) {
        const selfId = selfUser._id;
        const post = await PostModel.findById(postId).populate("user", "f_name _id");
        if (!post) {
            const error = new Error("No such post Found.");
            error.statusCode = 400;
            throw error;
        }

        const index = post.likes.findIndex(id => id.equals(selfId));
        const isLiking = index === -1;

        if (!isLiking) {
            post.likes.splice(index, 1);
        } else {
            post.likes.push(selfId);

            // Subsystem coordination: Trigger notification via Factory Method
            if (post.user && !post.user._id.equals(selfId)) {
                try {
                    const notification = NotificationFactory.createNotification('like', {
                        sender: selfId,
                        reciever: post.user._id,
                        postId: postId.toString(),
                        actorName: selfUser.f_name
                    });
                    await notification.save();

                    /**
                     * BEHAVIORAL DESIGN PATTERN: OBSERVER PATTERN
                     * Broadcasts interaction to attached observers (AuditLogger, SocketBroadcast)
                     */
                    globalNotificationSubject.notify({
                        type: 'POST_LIKED',
                        actorId: selfId,
                        targetId: post.user._id,
                        notification
                    });
                } catch (notifErr) {
                    console.error("[PostFacade] Notification creation error on like:", notifErr);
                }
            }
        }

        await post.save();

        return {
            message: !isLiking ? "Post Unliked" : "Post Liked",
            likes: post.likes,
            likesCount: post.likes.length,
            shares: post.shares || 0,
            comments: post.comments || 0
        };
    }
}

module.exports = PostFacade;
