const NotificationModal = require("../models/notification");

// To Get Notification.
exports.getNotification = async (req, res) => {
    try {
        let ownId = req.user._id;
        // High-performance parallel execution with .lean() (skips heavy document hydration)
        const [notifications, unreadCount] = await Promise.all([
            NotificationModal.find({ reciever: ownId })
                .sort({ createdAt: -1 })
                .limit(50)
                .populate("sender", "f_name headline profilePic")
                .populate("reciever", "f_name headline profilePic")
                .lean(),
            NotificationModal.countDocuments({ reciever: ownId, isRead: false })
        ]);

        return res.status(200).json({
            message: "Notifications Fetched Successfully.",
            notifications: notifications,
            unreadCount: unreadCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// Once Notification Clicked it should be in read.
exports.updateRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const notification = await NotificationModal.findOneAndUpdate(
            { _id: notificationId, reciever: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: "Notification Not Found." });
        }

        const unreadCount = await NotificationModal.countDocuments({ reciever: req.user._id, isRead: false });

        return res.status(200).json({
            message: "Read Notification.",
            unreadCount: unreadCount
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// Mark all notifications as read
exports.markAllRead = async (req, res) => {
    try {
        let ownId = req.user._id;
        await NotificationModal.updateMany(
            { reciever: ownId, isRead: false },
            { $set: { isRead: true } }
        );

        return res.status(200).json({
            message: "All notifications marked as read.",
            unreadCount: 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};

// To get numbers of notifications left to read.
exports.activeNotify = async (req, res) => {
    try {
        let ownId = req.user._id;
        let count = await NotificationModal.countDocuments({ reciever: ownId, isRead: false });

        return res.status(200).json({
            message: "Notification Number Fetched Successfully.",
            count: count
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error.", message: err.message });
    }
};
