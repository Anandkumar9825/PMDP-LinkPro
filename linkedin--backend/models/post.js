// Import Mongoose.
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({ 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    desc: {
        type: String,
        default: ""
    },
    imageLink: {
        type: String,
        default: ""
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],
    comments: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String],
        default: []
    },
    mentions: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
},{ timestamps: true });

// High-performance compound indexes for lightning-fast feeds and profile lookups
PostSchema.index({ createdAt: -1 });
PostSchema.index({ user: 1, createdAt: -1 });
PostSchema.index({ likes: 1 });
PostSchema.index({ 'mentions.user': 1, 'mentions.status': 1 });
PostSchema.index({ tags: 1 });

const PostModel = mongoose.model('post', PostSchema);
module.exports = PostModel;
