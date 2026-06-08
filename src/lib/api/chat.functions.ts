import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  sender: "user" | "admin";
  text: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  status: "active" | "resolved";
  createdAt: string;
  updatedAt: string;
  unreadAdmin: number;
  unreadUser: number;
  messages: ChatMessage[];
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toPlainSession(doc: any): ChatSession {
  return {
    sessionId: doc.sessionId,
    status: doc.status ?? "active",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    unreadAdmin: doc.unreadAdmin ?? 0,
    unreadUser: doc.unreadUser ?? 0,
    messages: (doc.messages ?? []) as ChatMessage[],
    userName: doc.userName,
    userEmail: doc.userEmail,
    userPhone: doc.userPhone,
  };
}

// ── Server Functions ──────────────────────────────────────────────────────────

export const getChatSessionDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ sessionId: z.string() }))
  .handler(async ({ data }): Promise<{ success: boolean; session: ChatSession | null; error?: string }> => {
    try {
      const db = await connectDB();
      const chatsCol = db.collection("chats");

      const doc = await chatsCol.findOne({ sessionId: data.sessionId });

      if (!doc) {
        return { success: true, session: null };
      }

      // Mark user messages as read (admin replied, user opened chat)
      if (doc.unreadUser > 0) {
        await chatsCol.updateOne(
          { sessionId: data.sessionId },
          { $set: { unreadUser: 0 } }
        );
        doc.unreadUser = 0;
      }

      return { success: true, session: toPlainSession(doc) };
    } catch (e: any) {
      console.error("Failed to fetch chat session:", e);
      return { success: false, session: null, error: "Database error" };
    }
  });

export const addChatMessageDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    sessionId: z.string(),
    message: z.object({
      id: z.string(),
      sender: z.enum(["user", "admin"]),
      text: z.string(),
      timestamp: z.string(),
    }),
    userName: z.string().optional(),
    userEmail: z.string().optional(),
    userPhone: z.string().optional(),
  }))
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const db = await connectDB();
      const chatsCol = db.collection("chats");

      const existingDoc = await chatsCol.findOne({ sessionId: data.sessionId });
      const isUser = data.message.sender === "user";

      if (!existingDoc) {
        if (!isUser) return { success: false, error: "Admin cannot start a session." };

        const newSession: ChatSession = {
          sessionId: data.sessionId,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          unreadAdmin: 1,
          unreadUser: 0,
          messages: [data.message],
          userName: data.userName,
          userEmail: data.userEmail,
          userPhone: data.userPhone,
        };
        await chatsCol.insertOne(newSession);
      } else {
        const inc: Record<string, number> = {};
        const set: Record<string, any> = { updatedAt: new Date().toISOString() };

        if (isUser) {
          inc.unreadAdmin = 1;
        } else {
          inc.unreadUser = 1;
          set.status = "active";
        }

        if (data.userName) set.userName = data.userName;
        if (data.userEmail) set.userEmail = data.userEmail;
        if (data.userPhone) set.userPhone = data.userPhone;

        await chatsCol.updateOne(
          { sessionId: data.sessionId },
          { $push: { messages: data.message } as any, $set: set, $inc: inc }
        );
      }

      return { success: true };
    } catch (e: any) {
      console.error("Failed to add chat message:", e);
      return { success: false, error: "Database error" };
    }
  });

export const getAdminChatSessionsDb = createServerFn({ method: "POST" })
  .handler(async (): Promise<{ success: boolean; sessions: ChatSession[]; error?: string }> => {
    try {
      const db = await connectDB();
      const chatsCol = db.collection("chats");

      const docs = await chatsCol.find().sort({ updatedAt: -1 }).toArray();
      const sessions = docs.map(toPlainSession);

      return { success: true, sessions };
    } catch (e: any) {
      console.error("Failed to fetch admin chat sessions:", e);
      return { success: false, sessions: [], error: "Database error" };
    }
  });

export const resolveChatSessionDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ sessionId: z.string() }))
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const db = await connectDB();
      await db.collection("chats").updateOne(
        { sessionId: data.sessionId },
        { $set: { status: "resolved", updatedAt: new Date().toISOString(), unreadAdmin: 0 } }
      );
      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Database error" };
    }
  });

export const markAdminChatReadDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ sessionId: z.string() }))
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    try {
      const db = await connectDB();
      await db.collection("chats").updateOne(
        { sessionId: data.sessionId },
        { $set: { unreadAdmin: 0 } }
      );
      return { success: true };
    } catch {
      return { success: false };
    }
  });
