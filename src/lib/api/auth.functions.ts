import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import crypto from "node:crypto";

const LOCK_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours
const MAX_FAILED_ATTEMPTS = 3;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

// In-memory fallback lockout tracking
const memoryLocks: Record<string, { attempts: number; lockedUntil: number | null }> = {};

// In-memory session cache (tokenHash → session info)
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

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Verifies admin session from request cookie or Authorization header.
 * Returns session info if valid, null if unauthorized.
 * Used to protect all admin-only server functions.
 */
export async function verifyAdminAuth(): Promise<{ username: string; role: string } | null> {
  // Try to get the raw token from the event headers (cookie or Authorization)
  let rawToken: string | null = null;

  try {
    // TanStack Start server context — try getCookie
    const m = "vinxi/http";
    const { getCookie } = await import(/* @vite-ignore */ m);
    rawToken = getCookie("psw_admin_session") || null;
  } catch {
    // Not in request context or no cookie
  }

  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const now = Date.now();

  // 1. Check in-memory session cache first
  const memSess = memorySessions[tokenHash];
  if (memSess && memSess.expiresAt > now) {
    return { username: memSess.username, role: memSess.role };
  }

  // 2. Check DB sessions
  try {
    const db = await connectDB();
    if (db) {
      const sessionsCol = db.collection("admin_sessions");
      const session = await sessionsCol.findOne({ tokenHash });
      if (session && session.expiresAt && new Date(session.expiresAt).getTime() > now) {
        // Refresh memory cache
        memorySessions[tokenHash] = {
          username: session.username,
          role: session.role || "admin",
          expiresAt: new Date(session.expiresAt).getTime(),
        };
        return { username: session.username, role: session.role || "admin" };
      }
    }
  } catch {
    // DB unavailable — fall back to memory only
  }

  // Clean up expired memory sessions
  if (memSess) {
    delete memorySessions[tokenHash];
  }

  return null;
}

// ── Check Lockout Status ──────────────────────────────────────────────────
export const getLockoutStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ username: z.string() }))
  .handler(
    async ({
      data,
    }): Promise<{ isLocked: boolean; lockedUntil?: number; attemptsLeft?: number }> => {
      const userKey = data.username.trim().toLowerCase();
      const now = Date.now();

      try {
        const db = await connectDB();
        if (db) {
          const locksCol = db.collection("admin_lockouts");
          const lockRecord = await locksCol.findOne({ username: userKey });

          if (lockRecord && lockRecord.lockedUntil && lockRecord.lockedUntil > now) {
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
        // Fall back to memory locks if DB fails
      }

      const mem = memoryLocks[userKey];
      if (mem && mem.lockedUntil && mem.lockedUntil > now) {
        return { isLocked: true, lockedUntil: mem.lockedUntil, attemptsLeft: 0 };
      }

      return {
        isLocked: false,
        attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - (mem?.attempts || 0)),
      };
    },
  );

// ── Verify Admin Session (for frontend auth checks) ───────────────────────
export const verifyAdminSession = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ valid: boolean; username?: string; role?: string }> => {
    const session = await verifyAdminAuth();
    if (!session) return { valid: false };
    return { valid: true, username: session.username, role: session.role };
  },
);

// ── Logout Admin ──────────────────────────────────────────────────────────
export const logoutAdmin = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: boolean }> => {
    try {
      const m = "vinxi/http";
      const { getCookie, deleteCookie } = await import(/* @vite-ignore */ m);
      const rawToken = getCookie("psw_admin_session");

      if (rawToken) {
        const tHash = hashToken(rawToken);
        delete memorySessions[tHash];

        try {
          const db = await connectDB();
          if (db) {
            await db.collection("admin_sessions").deleteOne({ tokenHash: tHash });
          }
        } catch {
          // Non-critical — session will expire via TTL
        }
      }

      try {
        deleteCookie("psw_admin_session", { path: "/" });
      } catch {
        // Ignore cookie deletion failure
      }

      return { success: true };
    } catch {
      return { success: true };
    }
  },
);

// ── Admin Login with 3-Strike 3-Hour Lockout & Cryptographic Session ──────
export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    }),
  )
  .handler(async ({ data }): Promise<AuthResponse> => {
    const userKey = data.username.trim().toLowerCase();
    const now = Date.now();

    try {
      const db = await connectDB();
      if (db) {
        const locksCol = db.collection("admin_lockouts");
        const lockRecord = await locksCol.findOne({ username: userKey });

        if (lockRecord && lockRecord.lockedUntil && lockRecord.lockedUntil > now) {
          const remainingMinutes = Math.ceil((lockRecord.lockedUntil - now) / (60 * 1000));
          const timeStr =
            remainingMinutes > 60
              ? `${Math.ceil(remainingMinutes / 60)} hours`
              : `${remainingMinutes} minutes`;
          return {
            success: false,
            isLocked: true,
            lockedUntil: lockRecord.lockedUntil,
            attemptsLeft: 0,
            error: `Security Lockout Active: Too many failed login attempts (3/3). Account is locked for ${timeStr}.`,
          };
        }
      } else {
        const mem = memoryLocks[userKey];
        if (mem && mem.lockedUntil && mem.lockedUntil > now) {
          const remainingMinutes = Math.ceil((mem.lockedUntil - now) / (60 * 1000));
          return {
            success: false,
            isLocked: true,
            lockedUntil: mem.lockedUntil,
            attemptsLeft: 0,
            error: `Security Lockout Active: Account locked for 3 hours due to 3 failed login attempts.`,
          };
        }
      }

      // Offline DB Fallback Authentication
      if (!db) {
        const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "pools12";
        const isDefaultUser = userKey === "pools" || userKey === "admin";
        if (isDefaultUser && data.password === defaultPassword) {
          delete memoryLocks[userKey];
          return {
            success: true,
            token: "offline-mock-admin-token",
            user: { username: data.username, role: "admin" },
          };
        }

        const prevAttempts = (memoryLocks[userKey]?.attempts || 0) + 1;
        if (prevAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockedUntil = now + LOCK_DURATION_MS;
          memoryLocks[userKey] = { attempts: prevAttempts, lockedUntil };
          return {
            success: false,
            isLocked: true,
            lockedUntil,
            attemptsLeft: 0,
            error: `Security Lockout Triggered: 3 incorrect password attempts. Your access is locked for 3 hours.`,
          };
        }
        memoryLocks[userKey] = { attempts: prevAttempts, lockedUntil: null };
        const left = MAX_FAILED_ATTEMPTS - prevAttempts;
        return {
          success: false,
          attemptsLeft: left,
          error: `Invalid username or password. Warning: ${left} attempt(s) remaining before a 3-hour security lockout.`,
        };
      }

      const usersCol = db.collection("users");
      const locksCol = db.collection("admin_lockouts");
      const bcrypt = (await import("bcryptjs")).default;
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "pools12";

      // Check users collection first, then admin_users fallback
      let user = await usersCol.findOne({
        username: {
          $regex: new RegExp(`^${userKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        },
      });

      if (!user) {
        user = await db.collection("admin_users").findOne({
          username: {
            $regex: new RegExp(`^${userKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
          },
        });
      }

      // Seed default user if users collection is empty
      const userCount = await usersCol.countDocuments();
      if (userCount === 0 && !user) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        const insertRes = await usersCol.insertOne({
          username: "pools",
          password: hashedPassword,
          role: "admin",
          createdAt: new Date(),
        });
        if (userKey === "pools" || userKey === "admin") {
          user = {
            _id: insertRes.insertedId,
            username: userKey,
            password: hashedPassword,
            role: "admin",
          };
        }
      }

      // If user still not found in DB, but matches default credentials, register and allow login
      if (
        !user &&
        (userKey === "pools" || userKey === "admin") &&
        data.password === defaultPassword
      ) {
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        const insertRes = await usersCol.insertOne({
          username: userKey,
          password: hashedPassword,
          role: "admin",
          createdAt: new Date(),
        });
        user = {
          _id: insertRes.insertedId,
          username: userKey,
          password: hashedPassword,
          role: "admin",
        };
      }

      const handleFailedAttempt = async () => {
        const lockRecord = await locksCol.findOne({ username: userKey });
        const failedAttempts = (lockRecord?.failedAttempts || 0) + 1;

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockedUntil = now + LOCK_DURATION_MS;
          await locksCol.updateOne(
            { username: userKey },
            { $set: { failedAttempts, lockedUntil, lastAttempt: new Date() } },
            { upsert: true },
          );

          await db
            .collection("notifications")
            .insertOne({
              title: "Admin Account Locked",
              message: `Account "${data.username}" has been locked out for 3 hours after 3 failed login attempts.`,
              type: "system",
              read: false,
              createdAt: new Date(),
            })
            .catch(() => {});

          return {
            success: false,
            isLocked: true,
            lockedUntil,
            attemptsLeft: 0,
            error: `Security Lockout Triggered: 3 incorrect password attempts. Your access is locked for 3 hours.`,
          };
        } else {
          await locksCol.updateOne(
            { username: userKey },
            { $set: { failedAttempts, lastAttempt: new Date() } },
            { upsert: true },
          );
          const left = MAX_FAILED_ATTEMPTS - failedAttempts;
          return {
            success: false,
            attemptsLeft: left,
            error: `Invalid username or password. Warning: ${left} attempt(s) remaining before a 3-hour security lockout.`,
          };
        }
      };

      if (!user) {
        return handleFailedAttempt();
      }

      let isMatch = false;
      if (user.password === data.password) {
        isMatch = true;
        const newHashedPassword = await bcrypt.hash(data.password, 12);
        await usersCol.updateOne({ _id: user._id }, { $set: { password: newHashedPassword } });
      } else {
        isMatch = await bcrypt.compare(data.password, user.password);
      }

      if (!isMatch) {
        return handleFailedAttempt();
      }

      await locksCol.deleteOne({ username: userKey }).catch(() => {});
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
        console.warn(
          "[Auth] Failed to persist session to DB, using memory fallback:",
          sessionInsertErr,
        );
      }

      // Store in memory session cache
      memorySessions[tokenHash] = {
        username: user.username,
        role: user.role || "admin",
        expiresAt: now + SESSION_TTL_MS,
      };

      // Set HTTP-only cookie using vinxi/http
      try {
        const m = "vinxi/http";
        const { setCookie } = await import(/* @vite-ignore */ m);
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
    } catch (e: unknown) {
      console.error("Login Error:", e);
      return { success: false, error: "Internal server error during login." };
    }
  });
