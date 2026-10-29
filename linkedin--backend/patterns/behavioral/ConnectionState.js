/**
 * ============================================================================
 * DESIGN PATTERN: STATE PATTERN (Behavioral Pattern)
 * ============================================================================
 * 
 * OVERVIEW:
 * ---------
 * 1. Intent: Allow an object to change its behavior and available actions 
 *    when its internal state changes, making it look like its class changed.
 * 2. Why We Use It: In our LinkPro backend, user connections move through 
 *    distinct phases: `NotConnected` -> `PendingRequest` -> `Connected`.
 *    Scattering conditional checks throughout controllers leads to bugs and 
 *    invalid user actions (e.g., accepting a non-existent request or sending duplicates).
 * 3. How It Works: 
 *    - `ConnectionState` defines the base interface for connection rules.
 *    - `NotConnectedState`, `PendingRequestState`, and `ConnectedState` 
 *      handle state-specific logic and safely process or reject actions.
 * 
 * FILE LOCATION:
 * --------------
 * - Pattern: `linkedin--backend/patterns/behavioral/ConnectionState.js`
 * - Usage: `linkedin--backend/controller/user.js` (connection management)
 * ============================================================================
 */

const NotificationFactory = require('../creational/NotificationFactory');

/**
 * Base State Interface
 */
class ConnectionState {
    constructor(context) {
        this.context = context;
    }

    async sendRequest() {
        throw new Error("sendRequest() not supported in current state.");
    }

    async acceptRequest() {
        throw new Error("acceptRequest() not supported in current state.");
    }
}

/**
 * Concrete State 1: NotConnectedState
 * The two users have no active friendship or pending request.
 */
class NotConnectedState extends ConnectionState {
    async sendRequest() {
        const { senderUser, receiverUser } = this.context;
        const senderId = senderUser._id;
        const receiverId = receiverUser._id;

        receiverUser.pending_friends.push(senderId);
        if (!senderUser.sent_requests.some(id => id.equals(receiverId))) {
            senderUser.sent_requests.push(receiverId);
        }

        // Trigger notification via Factory Method
        const notification = NotificationFactory.createNotification('friendRequest', {
            sender: senderId,
            reciever: receiverId,
            actorName: senderUser.f_name
        });
        await notification.save();

        await receiverUser.save();
        await senderUser.save();

        // Transition state to Pending
        this.context.setState(new PendingRequestState(this.context));

        return {
            message: "Connection request sent successfully."
        };
    }

    async acceptRequest() {
        const error = new Error("No request from this user.");
        error.statusCode = 400;
        throw error;
    }
}

/**
 * Concrete State 2: PendingRequestState
 * A connection request has been sent and is awaiting acceptance.
 */
class PendingRequestState extends ConnectionState {
    async sendRequest() {
        const error = new Error("Already Sent Request.");
        error.statusCode = 400;
        throw error;
    }

    async acceptRequest() {
        const { senderUser: currentUser, receiverUser: requestingUser } = this.context;
        const currentUserId = currentUser._id;
        const requestingUserId = requestingUser._id;

        // Clean up pending & sent lists
        const pendingIdx = currentUser.pending_friends.findIndex(id => id.equals(requestingUserId));
        if (pendingIdx !== -1) {
            currentUser.pending_friends.splice(pendingIdx, 1);
        }

        const sentIdx = requestingUser.sent_requests.findIndex(id => id.equals(currentUserId));
        if (sentIdx !== -1) {
            requestingUser.sent_requests.splice(sentIdx, 1);
        }

        // Establish mutual connection
        currentUser.friends.push(requestingUserId);
        requestingUser.friends.push(currentUserId);

        // Trigger notification via Factory Method
        const notification = NotificationFactory.createNotification('requestAccepted', {
            sender: currentUserId,
            reciever: requestingUserId,
            actorName: currentUser.f_name
        });
        await notification.save();

        await requestingUser.save();
        await currentUser.save();

        // Transition state to Connected
        this.context.setState(new ConnectedState(this.context));

        return {
            message: "You are now connected."
        };
    }
}

/**
 * Concrete State 3: ConnectedState
 * Users are already mutual 1st-degree connections.
 */
class ConnectedState extends ConnectionState {
    async sendRequest() {
        const error = new Error("Already Friends.");
        error.statusCode = 400;
        throw error;
    }

    async acceptRequest() {
        const error = new Error("Already Friends.");
        error.statusCode = 400;
        throw error;
    }
}

/**
 * Context: ConnectionContext
 * Maintains the current ConnectionState instance and delegates requests.
 */
class ConnectionContext {
    constructor(senderUser, receiverUser) {
        this.senderUser = senderUser;
        this.receiverUser = receiverUser;
        this.state = null;
        this.determineInitialState();
    }

    setState(state) {
        this.state = state;
    }

    /**
     * Inspects current MongoDB relationship arrays to initialize the correct State.
     */
    determineInitialState() {
        const senderId = this.senderUser._id;
        const receiverId = this.receiverUser._id;

        const isAlreadyFriends = this.senderUser.friends.some(id => id.equals(receiverId));
        if (isAlreadyFriends) {
            this.state = new ConnectedState(this);
            return;
        }

        const isPendingInReceiver = this.receiverUser.pending_friends.some(id => id.equals(senderId));
        const isPendingInSender = this.senderUser.pending_friends.some(id => id.equals(receiverId));
        if (isPendingInReceiver || isPendingInSender) {
            this.state = new PendingRequestState(this);
            return;
        }

        this.state = new NotConnectedState(this);
    }

    async sendRequest() {
        return await this.state.sendRequest();
    }

    async acceptRequest() {
        return await this.state.acceptRequest();
    }
}

module.exports = {
    ConnectionState,
    NotConnectedState,
    PendingRequestState,
    ConnectedState,
    ConnectionContext
};
