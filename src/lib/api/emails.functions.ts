import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import { ObjectId } from "mongodb";

function toQueryId(id: string): any {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ── Submit Contact Form ───────────────────────────────────────────────────
export const submitContactFormDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email required"),
    phone: z.string().optional(),
    subject: z.string().optional(),
    message: z.string().min(1, "Message is required")
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database connection offline." };

      const emailsCol = db.collection("contact_emails");
      const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const doc = {
        _id: id as any,
        id,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || "",
        subject: data.subject?.trim() || "General Inquiry",
        message: data.message.trim(),
        read: false,
        createdAt: new Date().toISOString()
      };

      await emailsCol.insertOne(doc);

      // Create Admin Notification
      const notifsCol = db.collection("notifications");
      await notifsCol.insertOne({
        title: `New Web Email from ${data.name}`,
        message: `${data.subject || "Inquiry"}: "${data.message.substring(0, 80)}..."`,
        type: "system",
        read: false,
        createdAt: new Date()
      });

      return { success: true, id };
    } catch (e: any) {
      console.error("Failed to save contact email:", e);
      return { success: false, error: "Failed to send message. Please try again." };
    }
  });

// ── Get All Web Emails (Admin Dashboard) ─────────────────────────────────
export const getContactMessagesDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) return { success: true, messages: [] };

      const emailsCol = db.collection("contact_emails");
      const docs = await emailsCol.find().sort({ createdAt: -1 }).toArray();

      const messages: ContactMessage[] = docs.map(d => ({
        id: d.id || d._id.toString(),
        name: d.name,
        email: d.email,
        phone: d.phone || "",
        subject: d.subject || "General Inquiry",
        message: d.message,
        read: !!d.read,
        createdAt: d.createdAt || new Date().toISOString()
      }));

      return { success: true, messages };
    } catch (e: any) {
      console.error("Failed to fetch contact emails:", e);
      return { success: false, messages: [], error: "Failed to fetch Web Emails." };
    }
  });

// ── Mark Message as Read ──────────────────────────────────────────────────
export const markContactMessageReadDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database offline." };

      const emailsCol = db.collection("contact_emails");
      await emailsCol.updateOne(
        { $or: [{ _id: toQueryId(data.id) }, { id: data.id }] },
        { $set: { read: true } }
      );

      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Failed to mark as read." };
    }
  });

// ── Delete Message ───────────────────────────────────────────────────────
export const deleteContactMessageDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database offline." };

      const emailsCol = db.collection("contact_emails");
      await emailsCol.deleteOne({ $or: [{ _id: toQueryId(data.id) }, { id: data.id }] });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Failed to delete message." };
    }
  });
