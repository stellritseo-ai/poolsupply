import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

export const getUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const db = await connectDB();
      const usersCol = db.collection("users");
      const users = await usersCol.find({}, { projection: { password: 0 } }).toArray();
      
      const formatted = users.map(u => ({ 
        id: u._id.toString(), 
        username: u.username, 
        role: u.role, 
        createdAt: u.createdAt 
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
    role: z.enum(["admin", "manager", "viewer"])
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const usersCol = db.collection("users");
      
      // Check if user exists
      const existing = await usersCol.findOne({ username: data.username });
      if (existing) {
        return { success: false, error: "Username already exists." };
      }

      const bcrypt = (await import("bcryptjs")).default;
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const res = await usersCol.insertOne({
        username: data.username,
        password: hashedPassword,
        role: data.role,
        createdAt: new Date()
      });

      return { 
        success: true, 
        user: { id: res.insertedId.toString(), username: data.username, role: data.role } 
      };
    } catch (e: any) {
      return { success: false, error: "Failed to create user." };
    }
  });

export const deleteUser = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const usersCol = db.collection("users");
      const { ObjectId } = await import("mongodb");
      
      // Prevent deleting the main admin
      const user = await usersCol.findOne({ _id: new ObjectId(data.id) });
      if (user && user.username === "pools") {
        return { success: false, error: "Cannot delete the primary Super Admin account." };
      }

      await usersCol.deleteOne({ _id: new ObjectId(data.id) });
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
      const usersCol = db.collection("users");
      
      const user = await usersCol.findOne({ username: data.currentUsername });
      if (!user) return { success: false, error: "Authentication failed." };

      const bcrypt = (await import("bcryptjs")).default;
      const isMatch = await bcrypt.compare(data.currentPassword, user.password);
      if (!isMatch && user.password !== data.currentPassword) {
        return { success: false, error: "Incorrect current password." };
      }

      const updates: any = {};
      if (data.newUsername && data.newUsername !== data.currentUsername) {
        const existing = await usersCol.findOne({ username: data.newUsername });
        if (existing) return { success: false, error: "New username is already taken." };
        updates.username = data.newUsername;
      }
      
      if (data.newPassword) {
        updates.password = await bcrypt.hash(data.newPassword, 10);
      }

      if (Object.keys(updates).length > 0) {
        await usersCol.updateOne({ _id: user._id }, { $set: updates });
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Failed to update profile." };
    }
  });
