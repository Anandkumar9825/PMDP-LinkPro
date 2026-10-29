// Import Mongoose.
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "conversation",
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },
    message: {
        type: String,
        default: ""
    },
    picture: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    readAt: {
        type: Date
    },
    isDeletedForEveryone: {
        type: Boolean,
        default: false
    },
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }]
},{ timestamps: true });

// Ultra-fast conversation message retrieval and sorting
MessageSchema.index({ conversation: 1, createdAt: 1 });
MessageSchema.index({ conversation: 1, deletedFor: 1, createdAt: 1 });
MessageSchema.index({ sender: 1, createdAt: -1 });

const MessageModel = mongoose.model('message', MessageSchema);
module.exports = MessageModel;
