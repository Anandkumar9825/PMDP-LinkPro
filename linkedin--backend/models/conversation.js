// Import Mongoose.
const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({ 
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]
},{ timestamps: true });

// Ultra-fast conversation lookup by members and most recently updated chats
ConversationSchema.index({ members: 1 });
ConversationSchema.index({ updatedAt: -1 });

const ConversationModel = mongoose.model('conversation', ConversationSchema);
module.exports = ConversationModel;
