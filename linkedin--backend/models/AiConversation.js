const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'model'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const AiConversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    title: { type: String, default: "Career Coach Chat" },
    contextType: { type: String, default: "profile" },
    messages: [MessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('AiConversation', AiConversationSchema);
