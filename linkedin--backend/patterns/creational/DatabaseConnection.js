/**
 * ============================================================================
 * DESIGN PATTERN: SINGLETON PATTERN (Creational Pattern)
 * ============================================================================
 * 
 * OVERVIEW:
 * ---------
 * 1. Intent: Ensure a class has only one instance and provide a global point 
 *    of access to it throughout the application.
 * 2. Why We Use It: In Node.js/MongoDB applications, creating multiple database 
 *    connections wastes resources, exhausts connection pools, causes memory leaks, 
 *    and leads to uncoordinated re-connections.
 * 3. How It Works: 
 *    - The `DatabaseConnection` class restricts multiple initializations.
 *    - The static `getInstance()` method checks if a connection already exists.
 *    - If it exists, it returns the cached instance; otherwise, it creates it once.
 * 
 * FILE LOCATION:
 * --------------
 * - Pattern: `linkedin--backend/patterns/creational/DatabaseConnection.js`
 * - Usage: `linkedin--backend/connection.js` (loaded via `index.js`)
 * ============================================================================
 */

const mongoose = require('mongoose');

class DatabaseConnection {
    // Private static variable to hold the single instance
    static #instance = null;

    constructor() {
        if (DatabaseConnection.#instance) {
            throw new Error(
                "Use DatabaseConnection.getInstance() to get the single database connection instance."
            );
        }

        this.connectionUri =
            process.env.MONGO_URI ||
            'mongodb://127.0.0.1:27017/linkpro';

        this.isConnected = false;
        this.initConnection();
    }

    /**
     * Initializes the Mongoose MongoDB connection.
     */
    initConnection() {
        const connectionOptions = {
            maxPoolSize: 50,              // High-throughput connection pool
            minPoolSize: 10,              // Warm pre-allocated connections for zero cold-start delay
            serverSelectionTimeoutMS: 5000,// 5s timeout prevents hung HTTP requests
            socketTimeoutMS: 45000,       // 45s socket keep-alive
            family: 4,                    // IPv4 priority skips DNS resolution lag
            autoIndex: true               // Automatic index synchronization
        };

        mongoose
            .connect(this.connectionUri, connectionOptions)
            .then((res) => {
                this.isConnected = true;
                console.log("[Singleton DatabaseConnection] Database Successfully connected.");
            })
            .catch((err) => {
                this.isConnected = false;
                console.error("[Singleton DatabaseConnection] Connection error:", err);
            });
    }

    /**
     * Global Access Point for the Singleton instance.
     * Returns the existing instance or lazily creates a new one if none exists.
     * 
     * @returns {DatabaseConnection} The single database connection manager instance.
     */
    static getInstance() {
        if (!DatabaseConnection.#instance) {
            DatabaseConnection.#instance = new DatabaseConnection();
        }
        return DatabaseConnection.#instance;
    }

    /**
     * Helper method to check active connection status.
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState
        };
    }
}

module.exports = DatabaseConnection;
