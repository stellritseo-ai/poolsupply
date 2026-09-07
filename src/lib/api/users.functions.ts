import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

export const getUsers = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) return { success: true, users: [] };
      const usersCol = db.collection("users");
      const users = await usersCol.find({}, { projection: { password: 0 } }).toArray();

      const formatted = users.map(u => ({
        id: u._id.toString(),
        username: u.username,
        fullName: u.fullName || u.name || u.username,
        email: u.email || `${u.username}@poolsupplywholesalers.com`,
        role: u.role || "manager",
        status: u.status || "active",
        lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
      }));

      return { success: true, users: formatted };
    } catch (e: any) {
      console.error("Users fetch error:", e);
      return { success: false, error: "Failed to fetch users." };
    }
  });

export const createUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    role: z.enum(["admin", "manager", "viewer"]),
    fullName: z.string().optional(),
    email: z.string().email().optional(),
    status: z.enum(["active", "inactive"]).optional(),
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const usersCol = db.collection("users");

      // Check if username already exists
      const existing = await usersCol.findOne({ username: data.username.toLowerCase().trim() });
      if (existing) {
        return { success: false, error: "Username is already taken." };
      }

      const bcrypt = (await import("bcryptjs")).default;
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const newUserDoc = {
        username: data.username.toLowerCase().trim(),
        fullName: data.fullName || data.username,
        email: data.email || `${data.username.toLowerCase().trim()}@poolsupplywholesalers.com`,
        password: hashedPassword,
        role: data.role,
        status: data.status || "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const res = await usersCol.insertOne(newUserDoc);

      return {
        success: true,
        user: {
          id: res.insertedId.toString(),
          username: newUserDoc.username,
          fullName: newUserDoc.fullName,
          email: newUserDoc.email,
          role: newUserDoc.role,
          status: newUserDoc.status,
          createdAt: newUserDoc.createdAt.toISOString(),
        }
      };
    } catch (e: any) {
      return { success: false, error: "Failed to create staff account." };
    }
  });

export const updateUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    id: z.string(),
    username: z.string().min(3).optional(),
    fullName: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(["admin", "manager", "viewer"]).optional(),
    status: z.enum(["active", "inactive"]).optional(),
    password: z.string().min(6).optional(),
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const usersCol = db.collection("users");
      const { ObjectId } = await import("mongodb");

      const query = ObjectId.isValid(data.id) ? { _id: new ObjectId(data.id) } : { _id: data.id as any };
      const user = await usersCol.findOne(query);
      if (!user) return { success: false, error: "User not found." };

      const updates: any = { updatedAt: new Date() };

      if (data.username && data.username.toLowerCase().trim() !== user.username) {
        const usernameClean = data.username.toLowerCase().trim();
        const existing = await usersCol.findOne({ username: usernameClean });
        if (existing && existing._id.toString() !== user._id.toString()) {
          return { success: false, error: "Username is already in use." };
        }
        updates.username = usernameClean;
      }

      if (data.fullName !== undefined) updates.fullName = data.fullName;
      if (data.email !== undefined) updates.email = data.email;
      if (data.role !== undefined) updates.role = data.role;
      if (data.status !== undefined) updates.status = data.status;

      if (data.password && data.password.length >= 6) {
        const bcrypt = (await import("bcryptjs")).default;
        updates.password = await bcrypt.hash(data.password, 10);
      }

      await usersCol.updateOne(query, { $set: updates });

      return {
        success: true,
        user: {
          id: user._id.toString(),
          username: updates.username || user.username,
          fullName: updates.fullName || user.fullName,
          email: updates.email || user.email,
          role: updates.role || user.role,
          status: updates.status || user.status,
        }
      };
    } catch (e: any) {
      console.error("Update user error:", e);
      return { success: false, error: e.message || "Failed to update staff user." };
    }
  });

export const deleteUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const usersCol = db.collection("users");
      const { ObjectId } = await import("mongodb");

      const query = ObjectId.isValid(data.id) ? { _id: new ObjectId(data.id) } : { _id: data.id as any };
      const user = await usersCol.findOne(query);

      // Prevent deleting the main admin
      if (user && (user.username === "pools" || user.role === "superadmin")) {
        return { success: false, error: "Cannot delete the primary Super Admin account." };
      }

      await usersCol.deleteOne(query);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Failed to delete user." };
    }
  });

export const updateSuperAdmin = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    currentUsername: z.string(),
    newUsername: z.string().min(3).optional(),
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).optional()
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const usersCol = db.collection("users");

      const user = await usersCol.findOne({ username: data.currentUsername });
      if (!user) return { success: false, error: "Authentication failed. User not found." };

      const bcrypt = (await import("bcryptjs")).default;
      const isMatch = await bcrypt.compare(data.currentPassword, user.password);
      if (!isMatch && user.password !== data.currentPassword) {
        return { success: false, error: "Incorrect current password." };
      }

      const updates: any = { updatedAt: new Date() };
      if (data.newUsername && data.newUsername !== data.currentUsername) {
        const existing = await usersCol.findOne({ username: data.newUsername });
        if (existing) return { success: false, error: "New username is already taken." };
        updates.username = data.newUsername;
      }

      if (data.newPassword) {
        updates.password = await bcrypt.hash(data.newPassword, 10);
      }

      if (Object.keys(updates).length > 1) {
        await usersCol.updateOne({ _id: user._id }, { $set: updates });
      }

      return { success: true, updatedUsername: updates.username || user.username };
    } catch (e: any) {
      return { success: false, error: "Failed to update profile." };
    }
  });
