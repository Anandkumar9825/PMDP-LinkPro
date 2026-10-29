const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        required: true,
        index: true
    },
    comment: {
        type: String,
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
}, { timestamps: true });

CommentSchema.index({ post: 1, createdAt: -1 });

const CommentModel = mongoose.model('comment', CommentSchema);
module.exports = CommentModel;