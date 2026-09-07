import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { connectDB } from "../db";
import crypto from "node:crypto";

const LOCK_DURATION_MS = 2 * 60 * 60 * 1000; // 2 Hours in milliseconds
const MAX_FAILED_ATTEMPTS = 3;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days in milliseconds

// In-memory fallback lockout tracking
const memoryLocks: Record<string, { attempts: number; lockedUntil: number | null }> = {};
// In-memory fallback active sessions (when DB is temporarily offline)
const memorySessions: Record<string, { username: string; role: string; expiresAt: number }> = {};

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: { username: string; role: string };
  error?: string;
  isLocked?: boolean;
  lockedUntil?: number;
  attemptsLeft?: number;
}

export interface AdminUserSession {
  username: string;
  role: string;
}

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Server-side authority verification helper.
 * Validates the admin session from:
 * 1. Explicit token argument
 * 2. HTTP-only secure cookie 'psw_admin_session'
 * 3. 'Authorization: Bearer <token>' or 'x-admin-token' request header
 *
 * Returns the authenticated admin user details or null if unauthenticated.
 */
export async function verifyAdminAuth(explicitToken?: string): Promise<AdminUserSession | null> {
  try {
    let token = explicitToken;

    if (!token) {
      try {
        token = getCookie("psw_admin_session");
      } catch {
        // May fail in non-request contexts
      }
    }

    if (!token) {
      try {
        const authHeader = getRequestHeader("authorization") || getRequestHeader("x-admin-token");
        if (authHeader) {
          token = authHeader.replace(/^Bearer\s+/i, "").trim();
        }
      } catch {
        // Header lookup failed
      }
    }

    if (!token || typeof token !== "string" || token.length < 16) {
      return null;
    }

    const tHash = hashToken(token);
    const now = Date.now();

    // 1. Check database session
    try {
      const db = await connectDB();
      if (db) {
        const sessionsCol = db.collection("admin_sessions");
        const session = await sessionsCol.findOne({
          tokenHash: tHash,
          expiresAt: { $gt: new Date(now) },
        });

        if (session) {
          return {
            username: session.username,
            role: session.role || "admin",
          };
        }
      }
    } catch (dbErr) {
      console.warn("[Auth] DB session lookup fallback to memory:", dbErr);
    }

    // 2. Check memory session fallback
    const memSession = memorySessions[tHash];
    if (memSession && memSession.expiresAt > now) {
      return {
        username: memSession.username,
        role: memSession.role,
      };
    }

    return null;
  } catch (err) {
    console.error("[Auth] Session verification error:", err);
    return null;
  }
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
            attemptsLeft: 0,
          };
        }
        const attempts = lockRecord?.failedAttempts || 0;
        return {
          isLocked: false,
          attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - attempts),
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

// ── Verify Admin Session (Client Mount Check) ──────────────────────────────
export const verifyAdminSession = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().optional() }).optional())
  .handler(async ({ data }): Promise<{ authenticated: boolean; user?: AdminUserSession }> => {
    const user = await verifyAdminAuth(data?.token);
    if (!user) {
      return { authenticated: false };
    }
    return { authenticated: true, user };
  });

// ── Admin Logout ───────────────────────────────────────────────────────────
export const logoutAdmin = createServerFn({ method: "POST" })
  .inputValidator(z.object({ token: z.string().optional() }).optional())
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    try {
      let token = data?.token;
      if (!token) {
        try {
          token = getCookie("psw_admin_session");
        } catch {}
      }

      if (token) {
        const tHash = hashToken(token);
        delete memorySessions[tHash];

        try {
          const db = await connectDB();
          if (db) {
            await db.collection("admin_sessions").deleteOne({ tokenHash: tHash });
          }
        } catch (dbErr) {
          console.warn("[Auth] Error deleting session from DB:", dbErr);
        }
      }

      try {
        deleteCookie("psw_admin_session", { path: "/" });
      } catch {}

      return { success: true };
    } catch {
      return { success: true };
    }
  });

// ── Admin Login with 3-Strike 2-Hour Lockout & Cryptographic Session ──────
export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    })
  )
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
            error: `Security Lockout Active: Too many failed login attempts (3/3). Account is locked for ${timeStr}.`,
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
            error: `Security Lockout Active: Account locked for 2 hours due to 3 failed login attempts.`,
          };
        }
      }

      // No DB connection — block login entirely for security
      if (!db) {
        const prevAttempts = (memoryLocks[userKey]?.attempts || 0) + 1;
        if (prevAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockedUntil = now + LOCK_DURATION_MS;
          memoryLocks[userKey] = { attempts: 3, lockedUntil };
          return {
            success: false,
            isLocked: true,
            lockedUntil,
            attemptsLeft: 0,
            error: `Security Alert: 3 failed attempts reached. Account locked for 2 hours.`,
          };
        }
        memoryLocks[userKey] = { attempts: prevAttempts, lockedUntil: null };
        const left = MAX_FAILED_ATTEMPTS - prevAttempts;
        return {
          success: false,
          attemptsLeft: left,
          error: `Database connection required for authentication. Please try again in a moment. ${left} attempt(s) remaining before lockout.`,
        };
      }

      const usersCol = db.collection("users");
      const locksCol = db.collection("admin_security_locks");

      // Seed default user if empty
      const userCount = await usersCol.countDocuments();
      const bcrypt = (await import("bcryptjs")).default;

      if (userCount === 0) {
        const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "pools12";
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        await usersCol.insertOne({
          username: "pools",
          password: hashedPassword,
          role: "admin",
          createdAt: new Date(),
        });
      }

      const user = await usersCol.findOne({ username: data.username });

      const handleFailedAttempt = async () => {
        const lockRecord = await locksCol.findOne({ username: userKey });
        const failedAttempts = (lockRecord?.failedAttempts || 0) + 1;

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
            createdAt: new Date(),
          });

          return {
            success: false,
            isLocked: true,
            lockedUntil,
            attemptsLeft: 0,
            error: `Security Lockout Triggered: 3 incorrect password attempts. Your access is locked for 2 hours.`,
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
            error: `Invalid username or password. Warning: ${left} attempt(s) remaining before a 2-hour security lockout.`,
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

      // Generate cryptographically strong session token
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(token);
      const expiresAt = new Date(now + SESSION_TTL_MS);

      // Store in MongoDB sessions collection
      try {
        const sessionsCol = db.collection("admin_sessions");
        await sessionsCol.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
        await sessionsCol.insertOne({
          tokenHash,
          username: user.username,
          role: user.role || "admin",
          createdAt: new Date(),
          expiresAt,
        });
      } catch (sessionInsertErr) {
        console.warn("[Auth] Failed to persist session to DB, using memory fallback:", sessionInsertErr);
      }

      // Store in memory session fallback
      memorySessions[tokenHash] = {
        username: user.username,
        role: user.role || "admin",
        expiresAt: now + SESSION_TTL_MS,
      };

      // Set secure HTTP-only cookie
      try {
        setCookie("psw_admin_session", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: Math.floor(SESSION_TTL_MS / 1000),
        });
      } catch (cookieErr) {
        console.warn("[Auth] Could not set session cookie:", cookieErr);
      }

      return {
        success: true,
        token,
        user: { username: user.username, role: user.role || "admin" },
      };
    } catch (e: any) {
      console.error("Login Error:", e);
      return { success: false, error: `Authentication Error: ${e.message || String(e)}` };
    }
  });
