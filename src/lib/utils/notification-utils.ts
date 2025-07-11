import Notification from "@/lib/models/Notification";

export type NotificationType = "order" | "product" | "customer" | "newsletter" | "review";

export interface CreateNotificationData {
  type: NotificationType;
  message: string;
  link: string;
}

export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = new Notification({
      type: data.type,
      message: data.message,
      link: data.link,
      createdAt: new Date(),
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function getRecentNotifications(limit: number = 50) {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

export async function getNotificationCounts() {
  try {
    const counts = await Notification.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      order: 0,
      product: 0,
      customer: 0,
      newsletter: 0,
      review: 0,
      user: 0,
    };

    counts.forEach((item) => {
      if (item._id in result) {
        result[item._id as keyof typeof result] = item.count;
      }
    });

    return result;
  } catch (error) {
    console.error("Error fetching notification counts:", error);
    throw error;
  }
}
