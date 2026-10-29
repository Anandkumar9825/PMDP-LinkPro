const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({ 
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'friendRequest',
            'comment',
            'like',
            'requestAccepted',
            'comment_like',
            'message',
            'FRIEND_REQUEST',
            'REQUEST_ACCEPTED',
            'POST_LIKED',
            'POST_COMMENTED',
            'mention'
        ],
        default: 'friendRequest'
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    postId: {
        type: String,
        default: "",
        index: true
    },
    commentId: {
        type: String,
        default: "",
        index: true
    }
}, { timestamps: true });

NotificationSchema.index({ reciever: 1, isRead: 1, createdAt: -1 });

const NotificationModal = mongoose.model('notification', NotificationSchema);
module.exports = NotificationModal;