const mongoose = require('mongoose');

const AiCommentSuggestionSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'post', required: true, index: true },
    tone: { type: String, default: "professional" },
    suggestions: [String],
    contentHash: { type: String }, // To detect if post changed
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } } // TTL index for caching
}, { timestamps: true });

module.exports = mongoose.model('AiCommentSuggestion', AiCommentSuggestionSchema);
