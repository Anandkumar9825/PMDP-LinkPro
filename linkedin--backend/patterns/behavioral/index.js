/**
 * ============================================================================
 * PMDP DESIGN PATTERNS - BEHAVIORAL PATTERNS EXPORT
 * ============================================================================
 * Exports the behavioral design patterns implemented in the LinkPro project.
 * 
 * 1. Strategy Pattern: FeedStrategy (NetworkFeedStrategy, AdminFeedStrategy, PublicFeedStrategy, FeedContext)
 * 2. State Pattern: ConnectionState (NotConnectedState, PendingRequestState, ConnectedState, ConnectionContext)
 * 3. Observer Pattern: NotificationObserver (NotificationSubject, AuditLogObserver, SocketBroadcastObserver)
 * ============================================================================
 */

const {
    FeedStrategy,
    NetworkFeedStrategy,
    AdminFeedStrategy,
    PublicFeedStrategy,
    FeedContext
} = require('./FeedStrategy');

const {
    ConnectionState,
    NotConnectedState,
    PendingRequestState,
    ConnectedState,
    ConnectionContext
} = require('./ConnectionState');

const {
    NotificationObserver,
    AuditLogObserver,
    SocketBroadcastObserver,
    NotificationSubject,
    globalNotificationSubject,
    globalSocketObserver
} = require('./NotificationObserver');

module.exports = {
    FeedStrategy,
    NetworkFeedStrategy,
    AdminFeedStrategy,
    PublicFeedStrategy,
    FeedContext,
    ConnectionState,
    NotConnectedState,
    PendingRequestState,
    ConnectedState,
    ConnectionContext,
    NotificationObserver,
    AuditLogObserver,
    SocketBroadcastObserver,
    NotificationSubject,
    globalNotificationSubject,
    globalSocketObserver
};
