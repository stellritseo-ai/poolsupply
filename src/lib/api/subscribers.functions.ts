import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

export const subscribeEmail = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    try {
      const email = data.email.trim().toLowerCase();
      const db = await connectDB();
      const subscribersCol = db.collection("subscribers");

      // Check if already subscribed
      const existing = await subscribersCol.findOne({ email });
      if (existing) {
        return { success: false, error: "This email is already subscribed!" };
      }

      // Insert new subscriber
      await subscribersCol.insertOne({
        email,
        createdAt: new Date(),
      });

      return { success: true };
    } catch (e: any) {
      console.error("Failed to subscribe email:", e);
      return { success: false, error: "Failed to subscribe. Please try again later." };
    }
  });

export const getSubscribers = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const db = await connectDB();
      const subscribersCol = db.collection("subscribers");

      const subscribers = await subscribersCol.find().sort({ createdAt: -1 }).toArray();

      const formatted = subscribers.map(s => ({
        id: s._id.toString(),
        email: s.email,
        createdAt: s.createdAt,
      }));

      return { success: true, subscribers: formatted };
    } catch (e: any) {
      console.error("Failed to fetch subscribers:", e);
      return { success: false, error: "Failed to retrieve subscriber list." };
    }
  });

export const deleteSubscriber = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const subscribersCol = db.collection("subscribers");
      const { ObjectId } = await import("mongodb");

      await subscribersCol.deleteOne({ _id: new ObjectId(data.id) });

      return { success: true };
    } catch (e: any) {
      console.error("Failed to delete subscriber:", e);
      return { success: false, error: "Failed to delete subscriber." };
    }
  });
