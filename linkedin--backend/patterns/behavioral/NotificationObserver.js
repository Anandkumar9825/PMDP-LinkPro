/**
 * ============================================================================
 * DESIGN PATTERN: OBSERVER PATTERN (Behavioral Pattern)
 * ============================================================================
 * 
 * OVERVIEW:
 * ---------
 * 1. Intent: Define a one-to-many relationship where a change in one object 
 *    automatically notifies and updates all dependent objects.
 * 2. Why We Use It: In our LinkPro backend, when a key action occurs (like 
 *    liking a post or accepting a request), multiple systems need to react:
 *    - Storing notifications in MongoDB
 *    - Pushing live events via WebSockets
 *    - Logging analytics/audit trails
 *    Tightly binding all these actions inside controllers makes code rigid and messy.
 * 3. How It Works: 
 *    - `NotificationSubject` acts as the publisher keeping track of listeners.
 *    - `NotificationObserver` is the base interface for subscribers.
 *    - Specific observers (`AuditLogObserver`, `SocketBroadcastObserver`) 
 *      listen for events and process them independently.
 * 
 * FILE LOCATION:
 * --------------
 * - Pattern: `linkedin--backend/patterns/behavioral/NotificationObserver.js`
 * - Usage: `index.js` and various controllers (`post.js`, `user.js`, `comment.js`)
 * ============================================================================
 */

/**
 * Observer Interface
 */
class NotificationObserver {
    update(eventData) {
        throw new Error("Method update() must be implemented by concrete Observer.");
    }
}

/**
 * Concrete Observer 1: AuditLogObserver
 * Logs system-level interactions for compliance, debugging, and analytics.
 */
class AuditLogObserver extends NotificationObserver {
    update(eventData) {
        const { type, actorId, targetId, timestamp = new Date() } = eventData;
        console.log(`[Observer: AuditLog] [${timestamp.toISOString()}] Event: ${type} | Actor: ${actorId} -> Target: ${targetId}`);
    }
}

/**
 * Concrete Observer 2: SocketBroadcastObserver
 * Dispatches real-time events to connected Socket.IO sockets if registered.
 */
class SocketBroadcastObserver extends NotificationObserver {
    constructor(ioInstance = null, onlineUsersMap = null) {
        super();
        this.io = ioInstance;
        this.onlineUsers = onlineUsersMap;
    }

    setSocketContext(ioInstance, onlineUsersMap) {
        this.io = ioInstance;
        this.onlineUsers = onlineUsersMap;
    }

    update(eventData) {
        if (!this.io || !this.onlineUsers) return;

        const { targetId, notification } = eventData;
        if (!targetId || !notification) return;

        const targetSocketId = this.onlineUsers.get(targetId.toString());
        if (targetSocketId) {
            this.io.to(targetSocketId).emit("newNotification", notification);
        }
    }
}

/**
 * Subject (Publisher): NotificationSubject
 * Maintains subscriber list and broadcasts events to all registered observers.
 */
class NotificationSubject {
    constructor() {
        this.observers = [];
    }

    /**
     * Attaches an observer to the subject.
     */
    attach(observer) {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }

    /**
     * Detaches an observer from the subject.
     */
    detach(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    /**
     * Notifies all attached observers of an event.
     */
    notify(eventData) {
        for (const observer of this.observers) {
            try {
                observer.update(eventData);
            } catch (err) {
                console.error("[NotificationSubject] Error notifying observer:", err);
            }
        }
    }
}

// Global Singleton Subject instance for LinkPro system notifications
const globalNotificationSubject = new NotificationSubject();
const globalAuditObserver = new AuditLogObserver();
const globalSocketObserver = new SocketBroadcastObserver();

globalNotificationSubject.attach(globalAuditObserver);
globalNotificationSubject.attach(globalSocketObserver);

module.exports = {
    NotificationObserver,
    AuditLogObserver,
    SocketBroadcastObserver,
    NotificationSubject,
    globalNotificationSubject,
    globalSocketObserver
};
