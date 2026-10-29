/**
 * ============================================================================
 * DESIGN PATTERN: STRATEGY PATTERN (Behavioral Pattern)
 * ============================================================================
 * 
 * OVERVIEW:
 * ---------
 * 1. Intent: Encapsulate different algorithms into separate classes so they 
 *    can be swapped out interchangeably without changing the code that uses them.
 * 2. Why We Use It: In our LinkPro backend, the post feed changes based on user roles:
 *    - Admins see all platform posts.
 *    - Regular users see personalized network feeds.
 *    - Guests see a general public feed.
 *    Using the Strategy Pattern keeps our controller clean and avoids messy 
 *    if-else or switch statements (violating the Single Responsibility Principle).
 * 3. How It Works: 
 *    - `FeedStrategy` defines the base interface.
 *    - `AdminFeedStrategy`, `NetworkFeedStrategy`, and `PublicFeedStrategy` 
 *      contain the specific logic for each role.
 *    - `FeedContext` picks and runs the correct strategy at runtime.
 * 
 * FILE LOCATION:
 * --------------
 * - Pattern: `linkedin--backend/patterns/behavioral/FeedStrategy.js`
 * - Usage: `linkedin--backend/controller/post.js` (inside `getAllPost`)
 * ============================================================================
 */

const PostModel = require('../../models/post');
const User = require('../../models/user');

/**
 * Common Strategy Interface
 */
class FeedStrategy {
    async fetchFeed(user) {
        throw new Error("Method fetchFeed() must be implemented by concrete Strategy.");
    }
}

/**
 * Concrete Strategy 1: NetworkFeedStrategy
 * Tailored LinkedIn algorithm for authenticated standard users:
 * Displays:
 * 1. Posts by the logged-in user.
 * 2. Posts created by direct friends.
 * 3. Posts liked by direct friends (attaching activity header).
 */
class NetworkFeedStrategy extends FeedStrategy {
    async fetchFeed(user) {
        const userId = user._id;
        let friendMap = new Map();
        let friendIds = [];

        const freshUser = await User.findById(userId).populate('friends', 'f_name headline profilePic');
        if (freshUser && freshUser.friends) {
            friendIds = freshUser.friends.map(f => f._id);
            freshUser.friends.forEach(f => {
                friendMap.set(f._id.toString(), {
                    _id: f._id,
                    f_name: f.f_name,
                    headline: f.headline,
                    profilePic: f.profilePic
                });
            });
        }

        const filter = {
            $or: [
                { user: userId },
                { user: { $in: friendIds } },
                { likes: { $in: friendIds } }
            ]
        };

        const rawPosts = await PostModel.find(filter)
            .sort({ createdAt: -1 })
            .limit(100)
            .populate("user", "-password")
            .populate("likes", "f_name headline profilePic")
            .populate("mentions.user", "f_name headline profilePic")
            .lean();

        // Attach Friend-Activity metadata
        const enrichedPosts = rawPosts.map(post => {
            const postObj = post.toObject ? post.toObject() : { ...post };
            const userIdStr = userId.toString();
            const authorIdStr = post.user?._id?.toString();
            const isAuthorMe = authorIdStr === userIdStr;
            const isAuthorMyFriend = friendMap.has(authorIdStr);

            if (!isAuthorMe && !isAuthorMyFriend && Array.isArray(post.likes)) {
                const friendWhoLiked = post.likes.find(liker => {
                    const likerId = liker._id ? liker._id.toString() : liker.toString();
                    return friendMap.has(likerId);
                });

                if (friendWhoLiked) {
                    const friendKey = friendWhoLiked._id ? friendWhoLiked._id.toString() : friendWhoLiked.toString();
                    const friendDetails = friendMap.get(friendKey);
                    postObj.activityHeader = {
                        type: 'CONNECTION_LIKED',
                        user: friendDetails
                    };
                }
            }

            return postObj;
        });

        return {
            posts: enrichedPosts,
            isFeedEmpty: enrichedPosts.length === 0,
            hasFriends: friendIds.length > 0
        };
    }
}

/**
 * Concrete Strategy 2: AdminFeedStrategy
 * Unrestricted platform-wide feed strategy for administrators.
 */
class AdminFeedStrategy extends FeedStrategy {
    async fetchFeed(user) {
        const rawPosts = await PostModel.find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .populate("user", "-password")
            .populate("likes", "f_name headline profilePic")
            .populate("mentions.user", "f_name headline profilePic")
            .lean();

        const posts = rawPosts.map(post => (post.toObject ? post.toObject() : { ...post }));

        return {
            posts,
            isFeedEmpty: posts.length === 0,
            hasFriends: true
        };
    }
}

/**
 * Concrete Strategy 3: PublicFeedStrategy
 * Default public feed strategy for guests or unauthenticated users.
 */
class PublicFeedStrategy extends FeedStrategy {
    async fetchFeed() {
        const rawPosts = await PostModel.find({})
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("user", "-password")
            .populate("likes", "f_name headline profilePic")
            .populate("mentions.user", "f_name headline profilePic");

        const posts = rawPosts.map(post => post.toObject());

        return {
            posts,
            isFeedEmpty: posts.length === 0,
            hasFriends: false
        };
    }
}

/**
 * Context: FeedContext
 * Maintains a reference to one of the concrete Strategy objects and 
 * executes the algorithm on behalf of the client.
 */
class FeedContext {
    constructor(strategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy) {
        this.strategy = strategy;
    }

    async executeStrategy(user) {
        if (!this.strategy) {
            throw new Error("[FeedContext] No FeedStrategy defined.");
        }
        return await this.strategy.fetchFeed(user);
    }

    /**
     * Factory selector to resolve the appropriate strategy based on user role.
     */
    static resolveStrategy(user) {
        if (!user || !user._id) {
            return new PublicFeedStrategy();
        }
        if (user.role === 'admin') {
            return new AdminFeedStrategy();
        }
        return new NetworkFeedStrategy();
    }
}

module.exports = {
    FeedStrategy,
    NetworkFeedStrategy,
    AdminFeedStrategy,
    PublicFeedStrategy,
    FeedContext
};
