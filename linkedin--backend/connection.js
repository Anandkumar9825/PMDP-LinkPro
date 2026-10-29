/**
 * ============================================================================
 * DESIGN PATTERN USAGE: SINGLETON PATTERN (Creational Pattern)
 * ============================================================================
 * 
 * WHAT IS THIS PATTERN?
 * --------------------
 * The Singleton Pattern ensures a class has only one instance and provides a 
 * global point of access to it.
 * 
 * WHY ARE WE USING THIS PATTERN?
 * ------------------------------
 * Instead of invoking multiple ad-hoc `mongoose.connect()` calls throughout
 * the application, we use the Singleton Pattern. This guarantees that only 
 * one centralized database connection is initialized and maintained throughout
 * the entire Node.js server lifecycle, avoiding duplicate connection pools,
 * memory leaks, and redundant socket handshakes.
 * 
 * WHERE ARE WE USING THIS PATTERN?
 * --------------------------------
 * Here in `connection.js` (called on server startup in `index.js`).
 * It invokes `DatabaseConnection.getInstance()`, accessing the single instance.
 * ============================================================================
 */

const DatabaseConnection = require('./patterns/creational/DatabaseConnection');

// Retrieve and initialize the Singleton instance of DatabaseConnection
const dbInstance = DatabaseConnection.getInstance();

module.exports = dbInstance;
