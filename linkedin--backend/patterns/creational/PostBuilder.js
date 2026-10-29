/**
 * ============================================================================
 * DESIGN PATTERN: BUILDER PATTERN (Creational Pattern)
 * ============================================================================
 * 
 * OVERVIEW:
 * ---------
 * 1. Intent: Separate the construction of a complex object from its representation 
 *    so that the same step-by-step process can build different variations.
 * 2. Why We Use It: In our LinkPro backend, a Post has many optional and complex 
 *    attributes (descriptions, images, hashtags, counters). Using giant constructors 
 *    or messy object literals leads to bugs, missing defaults, and confusing code.
 * 3. How It Works: 
 *    - `PostBuilder` provides a fluent, step-by-step API to configure properties incrementally.
 *    - The `.build()` method validates required fields (like the author ID) 
 *      and sets safe defaults before producing the final Mongoose `PostModel` document.
 * 
 * FILE LOCATION:
 * --------------
 * - Pattern: `linkedin--backend/patterns/creational/PostBuilder.js`
 * - Usage: `linkedin--backend/controller/post.js` (inside the `addPost` function)
 * ============================================================================
 */

const PostModel = require('../../models/post');

class PostBuilder {
    constructor() {
        this.reset();
    }

    /**
     * Resets the builder state to default empty values.
     */
    reset() {
        this.userId = null;
        this.desc = "";
        this.imageLink = "";
        this.tags = [];
        this.shares = 0;
        this.likes = [];
        this.comments = 0;
        this.mentions = [];
        return this;
    }

    /**
     * Sets the author / user ID (Required).
     * @param {string|mongoose.Types.ObjectId} userId
     */
    setUser(userId) {
        if (!userId) {
            throw new Error("[PostBuilder] Post author (userId) is required.");
        }
        this.userId = userId;
        return this;
    }

    /**
     * Sets the text description of the post.
     * @param {string} desc
     */
    setDescription(desc) {
        this.desc = typeof desc === 'string' ? desc.trim() : "";
        return this;
    }

    /**
     * Sets the image URL/link for the post.
     * @param {string} imageLink
     */
    setImage(imageLink) {
        this.imageLink = typeof imageLink === 'string' ? imageLink.trim() : "";
        return this;
    }

    /**
     * Sets and normalizes tags/hashtags for the post.
     * Accepts either an array of strings or a comma/space-separated string.
     * @param {string[]|string} tags
     */
    setTags(tags) {
        if (Array.isArray(tags)) {
            this.tags = tags.map(t => String(t).trim()).filter(Boolean);
        } else if (typeof tags === 'string' && tags.trim().length > 0) {
            this.tags = tags
                .split(/[\s,]+/)
                .map(t => t.trim())
                .filter(Boolean);
        } else {
            this.tags = [];
        }
        return this;
    }

    /**
     * Sets the initial share count.
     * @param {number} count
     */
    setShares(count) {
        this.shares = typeof count === 'number' && count >= 0 ? count : 0;
        return this;
    }

    /**
     * Sets initial likes array.
     * @param {Array} likes
     */
    setLikes(likes) {
        this.likes = Array.isArray(likes) ? likes : [];
        return this;
    }

    /**
     * Sets initial comment count.
     * @param {number} count
     */
    setComments(count) {
        this.comments = typeof count === 'number' && count >= 0 ? count : 0;
        return this;
    }

    /**
     * Validates configuration and returns the fully assembled PostModel instance.
     * 
     * @returns {PostModel} Fully constructed Mongoose Post document ready to be saved.
     */

    setMentions(mentions) {
        this.mentions = Array.isArray(mentions) ? mentions : [];
        return this;
    }
    build() {
        if (!this.userId) {
            throw new Error("[PostBuilder] Cannot build Post without a valid 'user' (author ID).");
        }

        const postData = {
            user: this.userId,
            desc: this.desc,
            imageLink: this.imageLink,
            tags: this.tags,
            shares: this.shares,
            likes: this.likes,
            comments: this.comments,
            mentions: this.mentions
        };

        return new PostModel(postData);
    }
}

module.exports = PostBuilder;
