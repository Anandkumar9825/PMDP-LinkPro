/**
 * ============================================================================
 * PMDP DESIGN PATTERNS - CREATIONAL PATTERNS EXPORT
 * ============================================================================
 * This index file exports all creational design patterns implemented in the 
 * LinkPro project for clean access and modular architecture.
 * 
 * 1. Singleton Pattern: DatabaseConnection
 * 2. Factory Method Pattern: NotificationFactory
 * 3. Builder Pattern: PostBuilder
 * ============================================================================
 */

const DatabaseConnection = require('./DatabaseConnection');
const NotificationFactory = require('./NotificationFactory');
const PostBuilder = require('./PostBuilder');

module.exports = {
    DatabaseConnection,
    NotificationFactory,
    PostBuilder
};
