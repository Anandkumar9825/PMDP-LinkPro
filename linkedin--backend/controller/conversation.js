const ConversationModal = require('../models/conversation');
const MessageModal = require('../models/message');

exports.addConversation = async (req, res) => {
    try {
        let senderId = req.user._id;
        let { recieverId, message } = req.body;
        let isConvExist = await ConversationModal.findOne({
            members: { $all: [senderId, recieverId] }
        });

        let targetConvId;
        if (!isConvExist) {
            let newConversation = new ConversationModal({
                members: [senderId, recieverId]
            });
            await newConversation.save();
            targetConvId = newConversation._id;
        } else {
            targetConvId = isConvExist._id;
        }

        if (message) {
            let addMessage = new MessageModal({
                sender: req.user._id,
                conversation: targetConvId,
                message,
                status: 'sent'
            });
            await addMessage.save();
        }

        const populatedConv = await ConversationModal.findById(targetConvId).populate("members", "-password");
        return res.status(201).json({ message: "Conversation ready", conversation: populatedConv });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error', message: err.message });
    }
};

exports.getConversation = async (req, res) => {
    try {
        let loggedinId = req.user._id;
        let conversations = await ConversationModal.find({
            members: { $in: [loggedinId] }
        }).populate("members", "-password").sort({ updatedAt: -1 }).lean();

        // Enrich with unread counts and latest message
        const enriched = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await MessageModal.countDocuments({
                    conversation: conv._id,
                    sender: { $ne: loggedinId },
                    status: { $ne: 'read' }
                });

                const lastMessage = await MessageModal.findOne({
                    conversation: conv._id,
                    deletedFor: { $ne: loggedinId }
                }).sort({ createdAt: -1 }).lean();

                return {
                    ...(conv.toObject ? conv.toObject() : conv),
                    unreadCount,
                    lastMessage
                };
            })
        );

        return res.status(200).json({
            message: "Fetched Successfully",
            conversations: enriched
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error', message: err.message });
    }
};