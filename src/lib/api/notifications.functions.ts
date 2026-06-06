import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

const DEFAULT_NOTIFICATIONS = [
  {
    title: "New Order Received",
    message: "Order #ORD-8942 has been placed by Sarah Jenkins.",
    type: "order",
    read: false,
    createdAt: new Date()
  },
  {
    title: "System Upgrade Complete",
    message: "The storefront was successfully updated to v2.4.1.",
    type: "system",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    title: "New Customer Review",
    message: "Michael T. left a 5-star review on 'Pentair IntelliFlo3'.",
    type: "review",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  }
];

export const getNotifications = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const db = await connectDB();
      const notifsCol = db.collection("notifications");
      
      let count = await notifsCol.countDocuments();
      if (count === 0) {
        await notifsCol.insertMany(DEFAULT_NOTIFICATIONS);
      }

      const notifications = await notifsCol.find().sort({ createdAt: -1 }).limit(20).toArray();
      
      const formatted = notifications.map(n => ({
        id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        createdAt: n.createdAt
      }));

      return { success: true, notifications: formatted };
    } catch (e: any) {
      console.error("Failed to fetch notifications:", e);
      return { success: false, error: "Failed to fetch notifications." };
    }
  });

export const markNotificationAsRead = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const notifsCol = db.collection("notifications");
      const { ObjectId } = await import("mongodb");
      
      await notifsCol.updateOne(
        { _id: new ObjectId(data.id) },
        { $set: { read: true } }
      );

      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Failed to mark as read." };
    }
  });

export const markAllNotificationsAsRead = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      const notifsCol = db.collection("notifications");
      
      await notifsCol.updateMany(
        { read: false },
        { $set: { read: true } }
      );

      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Failed to clear notifications." };
    }
  });

export const deleteNotification = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const notifsCol = db.collection("notifications");
      const { ObjectId } = await import("mongodb");
      
      await notifsCol.deleteOne({ _id: new ObjectId(data.id) });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Failed to delete notification." };
    }
  });
