import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

export interface GlobalSettingsType {
  _id: string;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  store: {
    name: string;
    tagline: string;
    supportEmail: string;
    phone: string;
    address: string;
    supportHours: string;
    currency: string;
  };
  logistics: {
    freeShippingThreshold: number;
    standardFreightRatePercent: number;
    estimatedDeliveryDays: string;
    handlingFee: number;
  };
  compliance: {
    taxRatePercent: number;
    taxExemptionEnabled: boolean;
    requireBusinessTaxId: boolean;
  };
  paymentMethods: Array<{
    id: string;
    name: string;
    active: boolean;
    mode: string;
    publicKey?: string;
  }>;
  stripe: {
    mode: "live" | "test";
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    fromName: string;
    fromEmail: string;
    adminAlertEmail: string;
  };
  analytics: {
    ga4Id: string;
    gtmId: string;
    metaPixelId: string;
  };
  notifications: {
    orderAlerts: boolean;
    inquiryAlerts: boolean;
    lowStockAlerts: boolean;
    discordWebhookUrl: string;
    slackWebhookUrl: string;
  };
  securityPolicy: {
    sessionTimeoutMinutes: number;
    maxFailedAttempts: number;
    lockoutDurationMinutes: number;
  };
}

const DEFAULT_SETTINGS: GlobalSettingsType = {
  _id: "global",
  maintenanceMode: false,
  maintenanceNotice: "We are currently performing scheduled maintenance to serve you better. We'll be back online shortly with exciting new updates.",
  store: {
    name: "Pool Supply Wholesalers",
    tagline: "Commercial Grade Pool Equipment & Supplies",
    supportEmail: "support@poolsupplywholesalers.com",
    phone: "(800) 555-POOL",
    address: "742 Evergreen Terrace, Suite 100, Phoenix, AZ 85001",
    supportHours: "Mon - Fri: 7:00 AM - 6:00 PM MST",
    currency: "USD ($)",
  },
  logistics: {
    freeShippingThreshold: 500,
    standardFreightRatePercent: 15,
    estimatedDeliveryDays: "3-5 Business Days",
    handlingFee: 0,
  },
  compliance: {
    taxRatePercent: 8.25,
    taxExemptionEnabled: true,
    requireBusinessTaxId: false,
  },
  paymentMethods: [
    {
      id: "stripe",
      name: "Stripe Live Payments",
      active: true,
      publicKey: "pk_live_51TxoN3LlienmBCcZCAlvmfLnIsLe0BaWwIaBTSm8CrVBjuh7dPLzpHbe9QXiWKR9zxPYdBqJNbEoPNDCSGWcL5C900sY0uRiB2",
      mode: "Live Production (256-bit SSL)",
    },
    { id: "paypal", name: "PayPal Wholesale", active: false, mode: "Standard B2B" },
    { id: "authorize", name: "Authorize.net", active: false, mode: "Commercial ACH" },
  ],
  stripe: {
    mode: "live",
    publishableKey: "pk_live_51TxoN3LlienmBCcZCAlvmfLnIsLe0BaWwIaBTSm8CrVBjuh7dPLzpHbe9QXiWKR9zxPYdBqJNbEoPNDCSGWcL5C900sY0uRiB2",
    secretKey: "sk_live_••••••••••••••••••••••••9xK2",
    webhookSecret: "whsec_••••••••••••••••••••••••7Fp1",
  },
  smtp: {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    user: "jitenksony@gmail.com",
    fromName: "Pool Supply Wholesalers Desk",
    fromEmail: "orders@poolsupplywholesalers.com",
    adminAlertEmail: "jitenksony@gmail.com, pswelio@yahoo.com",
  },
  analytics: {
    ga4Id: "G-PSWH99201X",
    gtmId: "GTM-KB882PL",
    metaPixelId: "982341908234",
  },
  notifications: {
    orderAlerts: true,
    inquiryAlerts: true,
    lowStockAlerts: true,
    discordWebhookUrl: "",
    slackWebhookUrl: "",
  },
  securityPolicy: {
    sessionTimeoutMinutes: 60,
    maxFailedAttempts: 5,
    lockoutDurationMinutes: 15,
  },
};

export const getGlobalSettings = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) {
        return { 
          success: true, 
          settings: DEFAULT_SETTINGS,
        };
      }
      const settingsCol = db.collection("settings");
      let settings = await settingsCol.findOne({ _id: "global" as any }) as any;

      if (!settings) {
        await settingsCol.insertOne(DEFAULT_SETTINGS as any);
        settings = DEFAULT_SETTINGS;
      } else {
        // Deep merge with defaults to ensure all nested keys exist
        settings = {
          ...DEFAULT_SETTINGS,
          ...settings,
          store: { ...DEFAULT_SETTINGS.store, ...(settings.store || {}) },
          logistics: { ...DEFAULT_SETTINGS.logistics, ...(settings.logistics || {}) },
          compliance: { ...DEFAULT_SETTINGS.compliance, ...(settings.compliance || {}) },
          stripe: { ...DEFAULT_SETTINGS.stripe, ...(settings.stripe || {}) },
          smtp: { ...DEFAULT_SETTINGS.smtp, ...(settings.smtp || {}) },
          analytics: { ...DEFAULT_SETTINGS.analytics, ...(settings.analytics || {}) },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(settings.notifications || {}) },
          securityPolicy: { ...DEFAULT_SETTINGS.securityPolicy, ...(settings.securityPolicy || {}) },
          paymentMethods: Array.isArray(settings.paymentMethods) && settings.paymentMethods.length > 0
            ? settings.paymentMethods
            : DEFAULT_SETTINGS.paymentMethods,
        };
      }

      return { 
        success: true, 
        settings: settings as GlobalSettingsType,
      };
    } catch (e: any) {
      console.error("Settings fetch error:", e);
      return { 
        success: true, 
        settings: DEFAULT_SETTINGS,
      };
    }
  });

export const updateGlobalSettings = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    maintenanceMode: z.boolean().optional(),
    maintenanceNotice: z.string().optional(),
    store: z.record(z.any()).optional(),
    logistics: z.record(z.any()).optional(),
    compliance: z.record(z.any()).optional(),
    paymentMethods: z.array(z.any()).optional(),
    stripe: z.record(z.any()).optional(),
    smtp: z.record(z.any()).optional(),
    analytics: z.record(z.any()).optional(),
    notifications: z.record(z.any()).optional(),
    securityPolicy: z.record(z.any()).optional(),
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: false, error: "Database connection unavailable." };
      }
      const settingsCol = db.collection("settings");
      
      const updateData: any = { updatedAt: new Date() };
      if (typeof data.maintenanceMode === "boolean") updateData.maintenanceMode = data.maintenanceMode;
      if (typeof data.maintenanceNotice === "string") updateData.maintenanceNotice = data.maintenanceNotice;
      if (data.store) updateData.store = data.store;
      if (data.logistics) updateData.logistics = data.logistics;
      if (data.compliance) updateData.compliance = data.compliance;
      if (data.paymentMethods) updateData.paymentMethods = data.paymentMethods;
      if (data.stripe) updateData.stripe = data.stripe;
      if (data.smtp) updateData.smtp = data.smtp;
      if (data.analytics) updateData.analytics = data.analytics;
      if (data.notifications) updateData.notifications = data.notifications;
      if (data.securityPolicy) updateData.securityPolicy = data.securityPolicy;

      await settingsCol.updateOne(
        { _id: "global" as any },
        { $set: updateData },
        { upsert: true }
      );

      return { success: true };
    } catch (e: any) {
      console.error("Settings update error:", e);
      return { success: false, error: "Failed to update settings." };
    }
  });

/**
 * Interactive MongoDB Atlas Roundtrip Ping Latency Test
 */
export const testMongoPing = createServerFn({ method: "POST" })
  .handler(async () => {
    const startTime = Date.now();
    try {
      const db = await connectDB();
      if (!db) {
        return { success: false, latencyMs: 0, error: "Database client connection offline." };
      }
      // Execute ping command
      const adminDb = db.admin();
      const pingResult = await adminDb.ping();
      const latencyMs = Date.now() - startTime;
      
      // Also get collection stats
      const collections = await db.listCollections().toArray();

      return {
        success: true,
        latencyMs,
        collectionsCount: collections.length,
        status: latencyMs < 100 ? "Optimal (Fast)" : latencyMs < 300 ? "Good" : "Degraded",
        timestamp: new Date().toISOString(),
        pingResult,
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: err.message || "Failed to ping database",
      };
    }
  });

/**
 * Interactive SMTP Verification - Dispatches a live test email to recipient
 */
export const sendTestEmail = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    recipientEmail: z.string().email(),
  }))
  .handler(async ({ data }) => {
    try {
      const nodemailer = (await import("nodemailer")).default;
      
      const gmailUser = process.env.GMAIL_USER || "jitenksony@gmail.com";
      const gmailPass = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
      const yahooUser = process.env.YAHOO_USER || "pswelio@yahoo.com";
      const yahooPass = (process.env.YAHOO_APP_PASSWORD || "").replace(/\s+/g, "");

      let transporter;
      let usedProvider = "Gmail Primary";

      if (gmailUser && gmailPass) {
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: gmailUser, pass: gmailPass },
        });
      } else if (yahooUser && yahooPass) {
        usedProvider = "Yahoo Mail";
        transporter = nodemailer.createTransport({
          service: "yahoo",
          auth: { user: yahooUser, pass: yahooPass },
        });
      }

      if (!transporter) {
        return {
          success: false,
          error: "No SMTP credentials configured in server environment. Configure GMAIL_USER/GMAIL_APP_PASSWORD.",
        };
      }

      const timestamp = new Date().toLocaleString("en-US", { timeZoneName: "short" });
      const info = await transporter.sendMail({
        from: `"Pool Supply Wholesalers Test Desk" <${gmailUser || yahooUser}>`,
        to: data.recipientEmail,
        subject: `✅ SMTP Integration Verification Test [${timestamp}]`,
        text: `This is a verified test email dispatched from your Pool Supply Wholesalers Settings Administration Panel.\n\nTime: ${timestamp}\nProvider: ${usedProvider}\nStatus: Active & Operational`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 32px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0;">
            <div style="background: #0ea5e9; color: white; padding: 16px; border-radius: 8px; text-align: center; font-weight: bold; font-size: 18px;">
              Pool Supply Wholesalers
            </div>
            <div style="padding: 24px; background: white; border-radius: 8px; margin-top: 16px;">
              <h2 style="color: #0f172a; margin-top: 0;">SMTP Test Succeeded! 🎉</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.5;">
                Your outgoing email notification pipeline is properly authenticated and delivering messages seamlessly.
              </p>
              <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 12px; color: #334155; font-family: monospace;">
                <strong>Provider:</strong> ${usedProvider}<br/>
                <strong>Recipient:</strong> ${data.recipientEmail}<br/>
                <strong>Dispatched:</strong> ${timestamp}
              </div>
            </div>
            <p style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 20px;">
              Admin Settings Diagnostic Diagnostic Tool · Pool Supply Wholesalers
            </p>
          </div>
        `,
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: usedProvider,
      };
    } catch (err: any) {
      console.error("Test email dispatch error:", err);
      return {
        success: false,
        error: err.message || "Failed to dispatch test email",
      };
    }
  });

/**
 * Security Audit & Lockout Management
 */
export const getSecurityAuditLogs = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) return { success: true, logs: [], locks: [] };

      // 1. Get recent security locks
      const locksCol = db.collection("admin_security_locks");
      const activeLocks = await locksCol.find({}).sort({ lockedUntil: -1 }).limit(20).toArray();

      // 2. Format locks
      const formattedLocks = activeLocks.map(l => ({
        id: l._id.toString(),
        key: l.key || l.identifier || "Unknown",
        failedAttempts: l.failedAttempts || 0,
        lockedUntil: l.lockedUntil ? new Date(l.lockedUntil).toISOString() : null,
        isLocked: l.lockedUntil ? new Date(l.lockedUntil) > new Date() : false,
        lastAttempt: l.lastAttempt ? new Date(l.lastAttempt).toISOString() : null,
      }));

      // 3. Get recent staff logins
      const usersCol = db.collection("users");
      const staffMembers = await usersCol.find({}, { projection: { password: 0 } }).limit(20).toArray();
      const loginLogs = staffMembers.map(u => ({
        id: u._id.toString(),
        username: u.username,
        role: u.role,
        lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
        status: u.status || "active",
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
      }));

      return {
        success: true,
        locks: formattedLocks,
        logins: loginLogs,
      };
    } catch (err: any) {
      console.error("Failed to load security audit logs:", err);
      return { success: false, error: "Failed to retrieve security audit logs." };
    }
  });

/**
 * Clear a security lockout for an IP or username
 */
export const clearSecurityLockout = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    key: z.string(),
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database offline." };
      const locksCol = db.collection("admin_security_locks");
      await locksCol.deleteMany({
        $or: [
          { key: data.key },
          { identifier: data.key },
          { _id: data.key as any },
        ]
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to clear lockout." };
    }
  });
