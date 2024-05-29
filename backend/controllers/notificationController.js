import Notification from "../models/notificationModel.js"

export const getNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		const notifications = await Notification.find({ to: userId }).populate({
			path: "from",
			select: "username profileImg",
		});

		await Notification.updateMany({ to: userId }, { read: true });

		res.status(200).json(notifications);
	} catch (error) {
		console.log("Error in getNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id
        await Notification.deleteMany({ to: userId })

        

        res.status(200).json({message: "Notifications deleted successfully"})
    } catch (error) {
        console.log("Error deleting notifications", error)
        res.status(500).json("Server error");
    }
}
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user._id;
        const notificationId = req.params.id;
        
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json("Notification not found");
        }

        if (notification.to.toString() !== userId.toString()) {
            return res.status(403).json("Unauthorized");
        }

        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        console.log("Error deleting notification", error.message);
        res.status(500).json({ error: "Server error" });
    }
};
