import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import crypto from "node:crypto";

const LOCK_DURATION_MS = 2 * 60 * 60 * 1000; // 2 Hours in milliseconds
const MAX_FAILED_ATTEMPTS = 3;

// In-memory fallback lockout tracking
const memoryLocks: Record<string, { attempts: number; lockedUntil: number | null }> = {};

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: { username: string; role: string };
  error?: string;
  isLocked?: boolean;
  lockedUntil?: number;
  attemptsLeft?: number;
}

// ── Check Lockout Status ──────────────────────────────────────────────────
export const getLockoutStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ username: z.string() }))
  .handler(async ({ data }): Promise<{ isLocked: boolean; lockedUntil?: number; attemptsLeft: number }> => {
    const userKey = data.username.trim().toLowerCase() || "pools";
    try {
      const db = await connectDB();
      if (db) {
        const locksCol = db.collection("admin_security_locks");
        const lockRecord = await locksCol.findOne({ username: userKey });
        if (lockRecord && lockRecord.lockedUntil && lockRecord.lockedUntil > Date.now()) {
          return {
            isLocked: true,
            lockedUntil: lockRecord.lockedUntil,
            attemptsLeft: 0
          };
        }
        const attempts = lockRecord?.failedAttempts || 0;
        return {
          isLocked: false,
          attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - attempts)
        };
      }
    } catch {
      // Memory fallback
    }

    const mem = memoryLocks[userKey];
    if (mem && mem.lockedUntil && mem.lockedUntil > Date.now()) {
      return { isLocked: true, lockedUntil: mem.lockedUntil, attemptsLeft: 0 };
    }
    return { isLocked: false, attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - (mem?.attempts || 0)) };
  });

// ── Admin Login with 3-Strike 2-Hour Lockout ──────────────────────────────
export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required")
  }))
  .handler(async ({ data }): Promise<AuthResponse> => {
    const userKey = data.username.trim().toLowerCase();
    const now = Date.now();

    try {
      const db = await connectDB();

      // Check current DB lockout
      if (db) {
        const locksCol = db.collection("admin_security_locks");
        const lockRecord = await locksCol.findOne({ username: userKey });

        if (lockRecord && lockRecord.lockedUntil && lockRecord.lockedUntil > now) {
          const remainingMinutes = Math.ceil((lockRecord.lockedUntil - now) / (60 * 1000));
          const hours = Math.floor(remainingMinutes / 60);
          const mins = remainingMinutes % 60;
          const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

          return {
            success: false,
            isLocked: true,
            lockedUntil: lockRecord.lockedUntil,
            attemptsLeft: 0,
            error: `Security Lockout Active: Too many failed login attempts (3/3). Account is locked for ${timeStr}.`
          };
        }
      } else {
        // Memory fallback check
        const mem = memoryLocks[userKey];
        if (mem && mem.lockedUntil && mem.lockedUntil > now) {
          const remainingMinutes = Math.ceil((mem.lockedUntil - now) / (60 * 1000));
          return {
            success: false,
            isLocked: true,
            lockedUntil: mem.lockedUntil,
            attemptsLeft: 0,
            error: `Security Lockout Active: Account locked for 2 hours due to 3 failed login attempts.`
          };
        }
      }

      // Offline DB Fallback Authentication
      if (!db) {
        if (data.username === "pools" && data.password === "pools12") {
          delete memoryLocks[userKey];
          return {
            success: true,
            token: "offline-mock-admin-token",
            user: { username: "pools", role: "admin" }
          };
        }

        const prevAttempts = (memoryLocks[userKey]?.attempts || 0) + 1;
        if (prevAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockedUntil = now + LOCK_DURATION_MS;
          memoryLocks[userKey] = { attempts: 3, lockedUntil };
          return {
            success: false,
            isLocked: true,
            lockedUntil,
            attemptsLeft: 0,
            error: `Security Alert: 3 failed attempts reached. Account locked for 2 hours.`
          };
        }

        memoryLocks[userKey] = { attempts: prevAttempts, lockedUntil: null };
        const left = MAX_FAILED_ATTEMPTS - prevAttempts;
        return {
          success: false,
          attemptsLeft: left,
          error: `Invalid credentials. Warning: ${left} attempt(s) remaining before a 2-hour security lockout.`
        };
      }

      const usersCol = db.collection("users");
      const locksCol = db.collection("admin_security_locks");

      // Seed default user if empty
      const userCount = await usersCol.countDocuments();
      const bcrypt = (await import("bcryptjs")).default;

      if (userCount === 0) {
        const hashedPassword = await bcrypt.hash("pools12", 10);
        await usersCol.insertOne({
          username: "pools",
          password: hashedPassword,
          role: "admin",
          createdAt: new Date()
        });
      }

      const user = await usersCol.findOne({ username: data.username });

      const handleFailedAttempt = async () => {
        const lockRecord = await locksCol.findOne({ username: userKey });
        const failedAttempts = ((lockRecord?.failedAttempts) || 0) + 1;

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockedUntil = now + LOCK_DURATION_MS;
          await locksCol.updateOne(
            { username: userKey },
            { $set: { failedAttempts: 3, lockedUntil, lockedAt: new Date() } },
            { upsert: true }
          );

          // Create notification for admin security log
          const notifsCol = db.collection("notifications");
          await notifsCol.insertOne({
            title: `⚠️ Security Alert: Login Lockout Triggered`,
            message: `Account "${data.username}" has been locked out for 2 hours after 3 failed login attempts.`,
            type: "system",
            read: false,
            createdAt: new Date()
          });

          return {
            success: false,
            isLocked: true,
            lockedUntil,
            attemptsLeft: 0,
            error: `Security Lockout Triggered: 3 incorrect password attempts. Your access is locked for 2 hours.`
          };
        } else {
          await locksCol.updateOne(
            { username: userKey },
            { $set: { failedAttempts, updatedAt: new Date() } },
            { upsert: true }
          );

          const left = MAX_FAILED_ATTEMPTS - failedAttempts;
          return {
            success: false,
            attemptsLeft: left,
            error: `Invalid username or password. Warning: ${left} attempt(s) remaining before a 2-hour security lockout.`
          };
        }
      };

      if (!user) {
        return await handleFailedAttempt();
      }

      let isMatch = false;
      if (user.password === data.password) {
        isMatch = true;
        const newHashedPassword = await bcrypt.hash(data.password, 10);
        await usersCol.updateOne({ _id: user._id }, { $set: { password: newHashedPassword } });
      } else {
        isMatch = await bcrypt.compare(data.password, user.password);
      }

      if (!isMatch) {
        return await handleFailedAttempt();
      }

      // Successful Login: Clear all security locks and failed attempts
      await locksCol.updateOne(
        { username: userKey },
        { $set: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } },
        { upsert: true }
      );
      delete memoryLocks[userKey];

      const token = crypto.randomBytes(32).toString('hex');

      return {
        success: true,
        token,
        user: { username: user.username, role: user.role }
      };
    } catch (e: any) {
      console.error("Login Error:", e);
      return { success: false, error: `Authentication Error: ${e.message || String(e)}` };
    }
  });
