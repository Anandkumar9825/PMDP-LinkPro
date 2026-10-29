/**
 * ============================================================================
 * DESIGN PATTERN: DECORATOR PATTERN (Structural Pattern)
 * ============================================================================
 * 
 * OVERVIEW:
 * ---------
 * 1. Intent: Attach additional responsibilities or features to an object 
 *    dynamically at runtime, providing a flexible alternative to subclassing.
 * 2. Why We Use It: Raw user posts require dynamic enhancements—such as 
 *    extracting hashtags (`#javascript`), sanitizing formatting, or adding metadata—
 *    without mutating the core post model or building rigid class hierarchies.
 * 3. How It Works: 
 *    - `BasePostContent` holds the core raw post data.
 *    - Concrete decorators (`HashtagExtractorDecorator`, `ContentSanitizerDecorator`) 
 *      wrap the component step-by-step, enriching the payload dynamically before saving.
 * 
 * FILE LOCATION:
 * --------------
 * - Pattern: `linkedin--backend/patterns/structural/PostDecorator.js`
 * - Usage: `PostFacade` and `controller/post.js` (during post processing)
 * ============================================================================
 */

/**
 * Base Component Interface
 */
class PostComponent {
    getPayload() {
        throw new Error("Method getPayload() must be implemented.");
    }
}

/**
 * Concrete Component: Base raw post content
 */
class BasePostContent extends PostComponent {
    constructor({ desc = "", imageLink = "", tags = [] } = {}) {
        super();
        this.desc = desc;
        this.imageLink = imageLink;
        this.tags = Array.isArray(tags) ? [...tags] : [];
    }

    getPayload() {
        return {
            desc: this.desc,
            imageLink: this.imageLink,
            tags: this.tags
        };
    }
}

/**
 * Abstract Decorator: PostDecorator
 * Wraps an existing PostComponent and delegates operations.
 */
class PostDecorator extends PostComponent {
    constructor(component) {
        super();
        this.component = component;
    }

    getPayload() {
        return this.component.getPayload();
    }
}

/**
 * Concrete Decorator 1: ContentSanitizerDecorator
 * Trims extraneous whitespaces and sanitizes description string.
 */
class ContentSanitizerDecorator extends PostDecorator {
    getPayload() {
        const payload = super.getPayload();
        return {
            ...payload,
            desc: typeof payload.desc === 'string' ? payload.desc.trim() : "",
            imageLink: typeof payload.imageLink === 'string' ? payload.imageLink.trim() : ""
        };
    }
}

/**
 * Concrete Decorator 2: HashtagExtractorDecorator
 * Automatically detects and extracts hashtags (e.g. #mern, #designpatterns)
 * from the post description and merges them into the tags list.
 */
class HashtagExtractorDecorator extends PostDecorator {
    getPayload() {
        const payload = super.getPayload();
        const extractedTags = [];

        if (typeof payload.desc === 'string') {
            const matches = payload.desc.match(/#[a-zA-Z0-9_]+/g);
            if (matches) {
                extractedTags.push(...matches.map(tag => tag.trim().toLowerCase()));
            }
        }

        // Deduplicate existing tags and extracted tags
        const allTags = Array.from(
            new Set([...payload.tags.map(t => String(t).trim().toLowerCase()), ...extractedTags])
        );

        return {
            ...payload,
            tags: allTags
        };
    }
}

module.exports = {
    PostComponent,
    BasePostContent,
    PostDecorator,
    ContentSanitizerDecorator,
    HashtagExtractorDecorator
};
