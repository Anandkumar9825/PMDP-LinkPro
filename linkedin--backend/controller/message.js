const MessageModal = require('../models/message');
const ConversationModal = require('../models/conversation');

// Send Message (Dedicated to Messaging channel only, no general notification creation)
exports.sendMessage = async (req, res) => {
    try {
        let { conversation, message, picture } = req.body;
        let addMessage = new MessageModal({
            sender: req.user._id,
            conversation,
            message: message || "",
            picture: picture || "",
            status: 'sent'
        });
        await addMessage.save();
        let populatedMessage = await addMessage.populate("sender", "f_name headline profilePic lastSeen isOnline");

        return res.status(201).json(populatedMessage);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

exports.getMessage = async (req, res) => {
    try {
        let { convId } = req.params;
        // High-speed lean query sorted chronologically
        let message = await MessageModal.find({
            conversation: convId,
            deletedFor: { $ne: req.user._id }
        })
        .sort({ createdAt: 1 })
        .populate("sender", "f_name headline profilePic lastSeen isOnline")
        .lean();

        return res.status(200).json({ messages: "Fetched Message Successfully", message });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// WhatsApp-style: Delete message for me
exports.deleteMessageForMe = async (req, res) => {
    try {
        const { messageId } = req.params;
        const msg = await MessageModal.findByIdAndUpdate(
            messageId,
            { $addToSet: { deletedFor: req.user._id } },
            { new: true }
        );
        if (!msg) {
            return res.status(404).json({ error: "Message not found" });
        }
        return res.status(200).json({ message: "Message deleted for you", messageId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// WhatsApp-style: Delete message for everyone (only message sender can do this)
exports.deleteMessageForEveryone = async (req, res) => {
    try {
        const { messageId } = req.params;
        const msg = await MessageModal.findById(messageId);
        if (!msg) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Verify sender
        if (msg.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only delete your own messages for everyone" });
        }

        msg.isDeletedForEveryone = true;
        msg.message = "This message was deleted";
        msg.picture = "";
        await msg.save();

        const populated = await msg.populate("sender", "f_name headline profilePic lastSeen isOnline");

        return res.status(200).json({
            message: "Message deleted for everyone",
            deletedMessage: populated
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// Clear Chat: clears all existing messages for the current user in this conversation
exports.clearChat = async (req, res) => {
    try {
        const { convId } = req.params;
        await MessageModal.updateMany(
            { conversation: convId },
            { $addToSet: { deletedFor: req.user._id } }
        );

        return res.status(200).json({ message: "Chat cleared successfully", convId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// Mark all messages in a conversation as read by the current user
exports.markAsRead = async (req, res) => {
    try {
        const { convId } = req.params;
        const result = await MessageModal.updateMany(
            {
                conversation: convId,
                sender: { $ne: req.user._id },
                status: { $ne: 'read' }
            },
            {
                $set: { status: 'read', readAt: new Date() }
            }
        );

        return res.status(200).json({
            message: "Messages marked as read",
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// Get total unread message count for the current logged-in user
exports.getTotalUnreadCount = async (req, res) => {
    try {
        const userConversations = await ConversationModal.find({
            members: { $in: [req.user._id] }
        }).select('_id');

        const convIds = userConversations.map(c => c._id);

        const totalUnread = await MessageModal.countDocuments({
            conversation: { $in: convIds },
            sender: { $ne: req.user._id },
            status: { $ne: 'read' }
        });

        return res.status(200).json({ totalUnread });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};