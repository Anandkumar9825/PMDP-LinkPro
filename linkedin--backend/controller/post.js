const PostModel = require('../models/post');
const NotificationModal = require('../models/notification');

// Import Creational Design Patterns
const PostBuilder = require('../patterns/creational/PostBuilder');
const NotificationFactory = require('../patterns/creational/NotificationFactory');

// Import Structural Design Patterns
const PostFacade = require('../patterns/structural/PostFacade');

// Import Behavioral Design Patterns
const { FeedContext } = require('../patterns/behavioral/FeedStrategy');

// To Add Post.
exports.addPost = async (req, res) => {
    try {
        const { desc, imageLink, tags, mentions } = req.body;
        let userId = req.user._id;

        /**
         * ====================================================================
         * STRUCTURAL DESIGN PATTERN APPLIED: FACADE PATTERN
         * (Coordinating Decorator, Builder, and Persistence Subsystems)
         * ====================================================================
         * 
         * WHAT IS THIS PATTERN?
         * --------------------
         * The Facade Pattern provides a simple, unified interface to an entire 
         * subsystem of complex classes, decorators, and builders.
         * 
         * WHY ARE WE USING THIS PATTERN?
         * ------------------------------
         * - Creating a post requires coordinating three distinct subsystems:
         *     1. Decorator Subsystem: Automatically extracts embedded hashtags 
         *        (#mern, #pmdp) and sanitizes description strings at runtime.
         *     2. Builder Subsystem (Creational): Assembles the PostModel step-by-step
         *        with validation.
         *     3. Persistence Subsystem: Saves to MongoDB and populates user info.
         *     4. Notification & Observer Subsystem: Dispatches mention events.
         * - PostFacade provides a single, high-level createPost() interface,
         *   preventing controller bloat and keeping the workflow clean and modular.
         * 
         * WHERE ARE WE USING THIS PATTERN?
         * --------------------------------
         * - Here in controller/post.js -> addPost function using PostFacade.
         * ====================================================================
         */
        const populatedPost = await PostFacade.createPost({
            userId,
            desc,
            imageLink,
            tags,
            mentions,
            actorName: req.user.f_name
        });

        return res.status(200).json({
            message: "Posted Successfully.",
            post: populatedPost
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// To Like and Dislike Post.
exports.likeDislikePost = async (req, res) => {
    try {
        let { postId } = req.body;
        if (!postId) {
            return res.status(400).json({ error: "No such post Found." });
        }

        /**
         * ====================================================================
         * STRUCTURAL DESIGN PATTERN APPLIED: FACADE PATTERN
         * (Coordinating Query, Likes Toggle, Notification Factory & Persistence)
         * ====================================================================
         * 
         * WHAT IS THIS PATTERN?
         * --------------------
         * The Facade Pattern encapsulates the multi-step post like/unlike workflow.
         * 
         * WHY ARE WE USING THIS PATTERN?
         * ------------------------------
         * - Toggling a like coordinates multiple subsystems:
         *     1. Model query and validation.
         *     2. Array mutation for user likes.
         *     3. Notification Factory subsystem: creating and saving notifications.
         *     4. Observer Pattern subsystem: real-time socket events & audit logging.
         *     5. Persistence of post metrics.
         * - PostFacade.toggleLike() unifies these subsystems behind one call.
         * 
         * WHERE ARE WE USING THIS PATTERN?
         * --------------------------------
         * - Here in controller/post.js -> likeDislikePost.
         * ====================================================================
         */
        const result = await PostFacade.toggleLike({
            selfUser: req.user,
            postId
        });

        return res.status(200).json(result);

    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// Share Post / increment share count
exports.sharePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        post.shares = (post.shares || 0) + 1;
        await post.save();

        return res.status(200).json({
            message: "Post shared successfully.",
            shares: post.shares
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// Smart Network Feed with Friend-Activity (Liked Posts) Distribution
exports.getAllPost = async (req, res) => {
    try {
        /**
         * ====================================================================
         * BEHAVIORAL DESIGN PATTERN APPLIED: STRATEGY PATTERN
         * ====================================================================
         * 
         * WHAT IS THIS PATTERN?
         * --------------------
         * The Strategy Pattern defines a family of algorithms, encapsulates 
         * each one, and makes them interchangeable at runtime.
         * 
         * WHY ARE WE USING THIS PATTERN?
         * ------------------------------
         * - Feed generation algorithms differ dynamically based on the viewer:
         *     - Standard User  -> NetworkFeedStrategy (1st-degree friends & their liked activity)
         *     - Administrator  -> AdminFeedStrategy (global unfiltered platform feed)
         *     - Guest / Public -> PublicFeedStrategy (general feed)
         * - FeedContext resolves and executes the appropriate strategy at runtime,
         *   encapsulating the query logic and allowing new feed algorithms (e.g. 
         *   trending posts, job posts) to be added without modifying the controller.
         * 
         * WHERE ARE WE USING THIS PATTERN?
         * --------------------------------
         * - Here in controller/post.js -> getAllPost.
         * ====================================================================
         */
        const strategy = FeedContext.resolveStrategy(req.user);
        const feedContext = new FeedContext(strategy);
        const feedResult = await feedContext.executeStrategy(req.user);

        return res.status(200).json({
            message: "Fetched Data",
            posts: feedResult.posts,
            isFeedEmpty: feedResult.isFeedEmpty,
            hasFriends: feedResult.hasFriends
        });

    } catch (err) {
        console.error("Feed fetch error:", err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// Get Post By Id.
exports.getPostByPostId = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await PostModel.findById(postId).populate("user", "-password").populate("mentions.user", "f_name headline profilePic").lean();
        if (!post) {
            return res.status(400).json({ error: "No Such Post Found." });
        }
        return res.status(200).json({
            message: "Fetched Data of Post By Id.",
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// Get Top 5 Post of User.
exports.getTop5PostForUser = async (req, res) => {
    try {
        let { userId } = req.params;
        const mongoose = require('mongoose');
        if (userId === 'me' && req.user?._id) userId = req.user._id.toString();
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(200).json({ message: "Fetched Data of Top 5 Posts.", posts: [] });
        }

        const posts = await PostModel.find({ user: userId }).sort({ createdAt: -1 }).populate("user", "-password").populate("mentions.user", "f_name headline profilePic").limit(5);
        return res.status(200).json({
            message: "Fetched Data of Top 5 Posts.",
            posts: posts
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// To Get All Posts of user.
exports.getAllPostForUser = async (req, res) => {
    try {
        let { userId } = req.params;
        const mongoose = require('mongoose');
        if (userId === 'me' && req.user?._id) userId = req.user._id.toString();
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(200).json({ message: "Fetched Data of All Posts.", posts: [] });
        }

        const posts = await PostModel.find({ user: userId }).sort({ createdAt: -1 }).populate("user", "-password").populate("mentions.user", "f_name headline profilePic").lean();
        return res.status(200).json({
            message: "Fetched Data of All Posts.",
            posts: posts
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// To Update / Edit Post (Author Permission strictly enforced)
exports.updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { desc } = req.body;

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        if (!post.user.equals(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized: You can only edit your own posts." });
        }

        if (desc !== undefined) {
            post.desc = desc;
        }

        await post.save();
        const updatedPost = await PostModel.findById(postId).populate("user", "-password");

        return res.status(200).json({
            message: "Post updated successfully.",
            post: updatedPost
        });
    } catch (err) {
        console.error("Update post error:", err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// To Delete Post (Author Permission strictly enforced)
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid Post ID format." });
        }

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        if (!post.user.equals(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized: You can only delete your own posts." });
        }

        const CommentModel = require('../models/comment');
        // Delete all comments associated with this post
        await CommentModel.deleteMany({ post: postId });

        // Delete all notifications related to this post
        await NotificationModal.deleteMany({ postId: postId.toString() });

        // Delete post
        await PostModel.findByIdAndDelete(postId);

        return res.status(200).json({ message: "Post and associated comments deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// To Save/Unsave Post
exports.toggleSavePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const User = require('../models/user');
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ error: 'User not found.' });

        const isSaved = user.savedPosts.includes(postId);
        if (isSaved) {
            user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
        } else {
            user.savedPosts.push(postId);
        }

        await user.save();
        return res.status(200).json({ message: isSaved ? 'Post unsaved.' : 'Post saved.', savedPosts: user.savedPosts });
    } catch (err) {
        console.error('Save post error:', err);
        res.status(500).json({ error: 'Server Error.' });
    }
};

// To Get Saved Posts
exports.getSavedPosts = async (req, res) => {
    try {
        const User = require('../models/user');
        const user = await User.findById(req.user._id).populate({
            path: 'savedPosts',
            populate: { path: 'user', select: '-password' }
        });

        if (!user) return res.status(404).json({ error: 'User not found.' });

        const validSavedPosts = user.savedPosts.filter(post => post != null);
        
        return res.status(200).json({ message: 'Saved posts fetched.', posts: validSavedPosts });
    } catch (err) {
        console.error('Get saved posts error:', err);
        res.status(500).json({ error: 'Server Error.' });
    }
};

// Respond to a post mention (Accept or Decline to display on profile)
exports.respondToMention = async (req, res) => {
    try {
        const { postId } = req.params;
        const { action } = req.body; // 'accepted' or 'rejected'
        const userId = req.user._id;

        if (!['accepted', 'rejected'].includes(action)) {
            return res.status(400).json({ error: "Action must be 'accepted' or 'rejected'." });
        }

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        const mention = (post.mentions || []).find(m => m.user.toString() === userId.toString());
        if (!mention) {
            return res.status(404).json({ error: "You are not mentioned in this post." });
        }

        mention.status = action;
        await post.save();

        const updatedPost = await PostModel.findById(postId)
            .populate("user", "-password")
            .populate("mentions.user", "f_name headline profilePic")
            .populate("likes", "f_name headline profilePic");

        return res.status(200).json({
            message: action === 'accepted' ? "Mention accepted! This post will now appear on your profile." : "Mention declined.",
            post: updatedPost
        });
    } catch (err) {
        console.error("Respond to mention error:", err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// Get posts where user was mentioned and accepted
exports.getTaggedPostsForUser = async (req, res) => {
    try {
        let { userId } = req.params;
        const mongoose = require('mongoose');
        if (userId === 'me' && req.user?._id) userId = req.user._id.toString();
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(200).json({ message: "Fetched Tagged Posts", posts: [] });
        }

        const posts = await PostModel.find({
            "mentions": {
                $elemMatch: { user: userId, status: 'accepted' }
            }
        })
        .sort({ createdAt: -1 })
        .populate("user", "-password")
        .populate("mentions.user", "f_name headline profilePic")
        .populate("likes", "f_name headline profilePic");

        return res.status(200).json({
            message: "Fetched Tagged Posts",
            posts: posts
        });
    } catch (err) {
        console.error("Get tagged posts error:", err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};
