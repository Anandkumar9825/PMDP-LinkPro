/**
 * ============================================================================
 * PMDP DESIGN PATTERNS - STRUCTURAL PATTERNS EXPORT
 * ============================================================================
 * Exports the structural design patterns implemented in the LinkPro project.
 * 
 * 1. Adapter Pattern: EmailServiceAdapter (NodemailerAdapter, DevConsoleEmailAdapter)
 * 2. Decorator Pattern: PostDecorator (HashtagExtractorDecorator, ContentSanitizerDecorator)
 * 3. Facade Pattern: PostFacade
 * ============================================================================
 */

const {
    EmailClientInterface,
    NodemailerAdapter,
    DevConsoleEmailAdapter,
    EmailServiceAdapterFactory
} = require('./EmailServiceAdapter');

const {
    PostComponent,
    BasePostContent,
    PostDecorator,
    ContentSanitizerDecorator,
    HashtagExtractorDecorator
} = require('./PostDecorator');

const PostFacade = require('./PostFacade');

module.exports = {
    EmailClientInterface,
    NodemailerAdapter,
    DevConsoleEmailAdapter,
    EmailServiceAdapterFactory,
    PostComponent,
    BasePostContent,
    PostDecorator,
    ContentSanitizerDecorator,
    HashtagExtractorDecorator,
    PostFacade
};
