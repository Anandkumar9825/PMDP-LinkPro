// Global crash prevention guards for Nodemon/Node
process.on('uncaughtException', (err) => {
    console.error('⚠️ [Uncaught Exception caught - preventing crash]:', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('⚠️ [Unhandled Rejection caught - preventing crash]:', reason);
});

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require("http");
require("dotenv").config({ path: "./config.env" });

const User = require('./models/user');

// Create Server.
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

require('./connection');
// Reset all stale online flags on server boot
User.updateMany({}, { isOnline: false }).exec().catch(() => {});

const PORT = process.env.PORT || 4000;

const compression = require('compression');
const helmet = require('helmet');

// Security: Helmet HTTP Headers protection
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));

// Performance: Gzip / Deflate compression for 3-5x faster network data transfers
app.use(compression({
    level: 6,
    threshold: 1024
}));

app.use(express.json());
app.use(cookieParser());

// To Allow Cross Origin.
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

// Socket.io real-time connection mapping (userId -> socketId)
const onlineUsers = new Map();

/**
 * ============================================================================
 * DESIGN PATTERN USAGE: OBSERVER PATTERN (Behavioral Pattern)
 * ============================================================================
 * 
 * WHAT IS THIS PATTERN?
 * --------------------
 * The Observer Pattern defines a subscription mechanism to notify multiple 
 * observers automatically about any events that happen to the subject object.
 * 
 * WHY ARE WE USING THIS PATTERN?
 * ------------------------------
 * - Attaches SocketBroadcastObserver to the global NotificationSubject.
 * - Whenever notification events occur across the backend subsystems,
 *   registered observers (AuditLogObserver, SocketBroadcastObserver) are
 *   automatically notified and dispatch real-time events without coupling.
 * 
 * WHERE ARE WE USING THIS PATTERN?
 * --------------------------------
 * - Here in index.js to bind Socket.IO and the onlineUsers map to the Observer system.
 * ============================================================================
 */
const { globalSocketObserver } = require('./patterns/behavioral/NotificationObserver');
globalSocketObserver.setSocketContext(io, onlineUsers);

io.on('connection', (socket) => {
    // Immediately provide current online users to connecting client
    socket.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    // Register user on socket connection
    socket.on("unregisterUser", async (userId) => {
        if (userId) {
            onlineUsers.delete(userId.toString());
            try {
                await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
            } catch (err) {}
            io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
        }
    });

    socket.on("registerUser", async (userId) => {
        if (userId) {
            onlineUsers.set(userId.toString(), socket.id);
            socket.userId = userId.toString();
            
            try {
                await User.findByIdAndUpdate(userId, { isOnline: true });
            } catch (err) {}

            io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
        }
    });

    socket.on("joinConversation", (conversationId) => {
        if (conversationId) {
            socket.join(conversationId.toString());
        }
    });

    socket.on("leaveConversation", (conversationId) => {
        if (conversationId) {
            socket.leave(conversationId.toString());
        }
    });

    // Send Message: broadcast to conversation room members (excluding sender to prevent duplicate echo)
    socket.on("sendMessage", (convId, messageDetail, receiverId) => {
        if (convId) {
            socket.to(convId.toString()).emit("receiveMessage", messageDetail);
        }

        if (receiverId) {
            const receiverSocketId = onlineUsers.get(receiverId.toString());
            if (receiverSocketId) {
                // Ensure receiver gets live message even if not yet in room
                io.to(receiverSocketId).emit("receiveMessage", messageDetail);
                // Also trigger unread message counter badge update
                io.to(receiverSocketId).emit("newUnreadMessage", {
                    convId,
                    message: messageDetail
                });
            }
        }
    });

    // Real-time Read Receipts event
    socket.on("markMessagesRead", ({ convId, readerId }) => {
        if (convId) {
            socket.to(convId.toString()).emit("messagesMarkedRead", { convId, readerId });
        }
    });

    // Real-time Delete Message For Everyone (WhatsApp style)
    socket.on("deleteMessageForEveryone", ({ convId, messageId }) => {
        if (convId) {
            socket.to(convId.toString()).emit("messageDeletedForEveryone", { convId, messageId });
        }
    });

    // Real-time Social Interaction Notification Event (likes, comments, friend requests)
    socket.on("sendNotification", ({ recieverId, notification }) => {
        const receiverSocketId = onlineUsers.get(recieverId?.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newNotification", notification);
        }
    });

    // Friend Request Revocation event
    socket.on("revokeFriendRequest", ({ targetId, senderId }) => {
        const targetSocketId = onlineUsers.get(targetId?.toString());
        if (targetSocketId) {
            io.to(targetSocketId).emit("friendRequestRevoked", { senderId });
        }
    });

    // Disconnect event
    socket.on("disconnect", async () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            try {
                await User.findByIdAndUpdate(socket.userId, {
                    isOnline: false,
                    lastSeen: new Date()
                });
            } catch (err) {}
        } else {
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    try {
                        await User.findByIdAndUpdate(userId, {
                            isOnline: false,
                            lastSeen: new Date()
                        });
                    } catch (err) {}
                    break;
                }
            }
        }

        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });
});

const UserRoutes = require('./routes/user');
const PostRoutes = require('./routes/post');
const NotificationRoutes = require('./routes/notification');
const CommentRoutes = require('./routes/comment');
const ConversationRoutes = require('./routes/conversation');
const MessageRoutes = require('./routes/message');
const AIRoutes = require('./routes/ai');

app.use('/api/auth', UserRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/network', UserRoutes);
app.use('/api/post', PostRoutes);
app.use('/api/posts', PostRoutes);
app.use('/api/notification', NotificationRoutes);
app.use('/api/comment', CommentRoutes);
app.use('/api/conversation', ConversationRoutes);
app.use('/api/message', MessageRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', AIRoutes);

server.listen(PORT, () => {
    console.log("Backend Server is running on Port", PORT);
});