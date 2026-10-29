/**
 * ============================================================================
 * DESIGN PATTERN: FACTORY METHOD PATTERN (Creational Pattern)
 * ============================================================================
 * 
 * OVERVIEW:
 * ---------
 * 1. Intent: Define an interface for creating objects, but let a specialized 
 *    factory method decide the exact structure and instantiation details.
 * 2. Why We Use It: In our LinkPro backend, notifications are created for 
 *    many different actions (likes, comments, connection requests). Hardcoding 
 *    `new NotificationModal()` across controllers leads to code duplication, 
 *    tight coupling, and a high risk of missing required fields.
 * 3. How It Works: 
 *    - `NotificationFactory` encapsulates notification creation.
 *    - Client code passes a type (e.g., 'like', 'comment', 'friendRequest') and parameters.
 *    - The factory standardizes message content and builds the notification uniformly.
 * 
 * FILE LOCATION:
 * --------------
 * - Pattern: `linkedin--backend/patterns/creational/NotificationFactory.js`
 * - Usage: Consumed across multiple controllers (`post.js`, `comment.js`, `user.js`)
 * ============================================================================
 */

const NotificationModal = require('../../models/notification');

/**
 * Base Abstract Creator for Notifications.
 */
class BaseNotificationCreator {
    /**
     * Factory Method to be implemented / overridden by concrete creators.
     */
    create(options) {
        throw new Error("Method create() must be implemented by concrete NotificationCreator.");
    }
}

/**
 * Concrete Creator for Like Notifications
 */
class LikeNotificationCreator extends BaseNotificationCreator {
    create(options) {
        const { sender, reciever, postId, actorName } = options;
        const displayName = actorName || 'Someone';
        const content = `${displayName} liked your post.`;

        return new NotificationModal({
            sender,
            reciever,
            content,
            type: "like",
            postId: postId ? postId.toString() : "",
            isRead: false
        });
    }
}

/**
 * Concrete Creator for Comment Notifications
 */
class CommentNotificationCreator extends BaseNotificationCreator {
    create(options) {
        const { sender, reciever, postId, commentId, actorName } = options;
        const displayName = actorName || 'Someone';
        const content = `${displayName} commented on your post.`;

        return new NotificationModal({
            sender,
            reciever,
            content,
            type: "comment",
            postId: postId ? postId.toString() : "",
            commentId: commentId ? commentId.toString() : "",
            isRead: false
        });
    }
}

/**
 * Concrete Creator for Comment Like Notifications
 */
class CommentLikeNotificationCreator extends BaseNotificationCreator {
    create(options) {
        const { sender, reciever, postId, commentId, actorName, isPostOwner } = options;
        const displayName = actorName || 'Someone';
        const content = isPostOwner
            ? `${displayName} liked a comment on your post.`
            : `${displayName} liked your comment.`;

        return new NotificationModal({
            sender,
            reciever,
            content,
            type: "comment_like",
            postId: postId ? postId.toString() : "",
            commentId: commentId ? commentId.toString() : "",
            isRead: false
        });
    }
}

/**
 * Concrete Creator for Friend / Connection Request Notifications
 */
class FriendRequestNotificationCreator extends BaseNotificationCreator {
    create(options) {
        const { sender, reciever, actorName } = options;
        const displayName = actorName || 'Someone';
        const content = `${displayName} sent you a connection request.`;

        return new NotificationModal({
            sender,
            reciever,
            content,
            type: "friendRequest",
            isRead: false
        });
    }
}

/**
 * Concrete Creator for Request Accepted Notifications
 */
class RequestAcceptedNotificationCreator extends BaseNotificationCreator {
    create(options) {
        const { sender, reciever, actorName } = options;
        const displayName = actorName || 'Someone';
        const content = `${displayName} accepted your connection request.`;

        return new NotificationModal({
            sender,
            reciever,
            content,
            type: "requestAccepted",
            isRead: false
        });
    }
}

/**
 * Concrete Creator for Mention Notifications
 */
class MentionNotificationCreator extends BaseNotificationCreator {
    create(options) {
        const { sender, reciever, postId, actorName } = options;
        const displayName = actorName || 'Someone';
        const content = `${displayName} mentioned you in a post.`;

        return new NotificationModal({
            sender,
            reciever,
            content,
            type: "mention",
            postId: postId ? postId.toString() : "",
            isRead: false
        });
    }
}

/**
 * NotificationFactory:
 * Acts as the centralized Factory that delegates object creation 
 * to the appropriate concrete Notification Creator.
 */
class NotificationFactory {
    static #creators = {
        'like': new LikeNotificationCreator(),
        'comment': new CommentNotificationCreator(),
        'comment_like': new CommentLikeNotificationCreator(),
        'friendRequest': new FriendRequestNotificationCreator(),
        'requestAccepted': new RequestAcceptedNotificationCreator(),
        'mention': new MentionNotificationCreator()
    };

    /**
     * Factory Method to instantiate a Notification object.
     * 
     * @param {string} type - Type of notification ('like', 'comment', 'comment_like', 'friendRequest', 'requestAccepted')
     * @param {object} options - Details including sender, reciever, postId, etc.
     * @returns {NotificationModal} An unsaved Mongoose notification document
     */
    static createNotification(type, options) {
        const creator = this.#creators[type];
        if (!creator) {
            // Fallback for custom or direct notifications
            return new NotificationModal({
                sender: options.sender,
                reciever: options.reciever,
                content: options.content || 'You have a new notification.',
                type: type || 'friendRequest',
                postId: options.postId ? options.postId.toString() : "",
                commentId: options.commentId ? options.commentId.toString() : "",
                isRead: false
            });
        }
        return creator.create(options);
    }
}

module.exports = NotificationFactory;
