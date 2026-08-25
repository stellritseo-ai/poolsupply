import nodemailer from "nodemailer";

function getEnvSecret(key: string): string {
  const val = process.env[key] || (typeof (globalThis as any).process !== "undefined" ? (globalThis as any).process?.env?.[key] : undefined);
  return typeof val === "string" ? val.trim() : "";
}

const GMAIL_USER = getEnvSecret("GMAIL_USER") || "jitenksony@gmail.com";
const GMAIL_APP_PASSWORD = getEnvSecret("GMAIL_APP_PASSWORD").replace(/\s+/g, "");

const YAHOO_USER = getEnvSecret("YAHOO_USER") || "pswelio@yahoo.com";
const YAHOO_APP_PASSWORD = getEnvSecret("YAHOO_APP_PASSWORD").replace(/\s+/g, "");

// Comma-separated list of admin emails to receive alerts
const ADMIN_NOTIFICATION_EMAIL = getEnvSecret("ADMIN_NOTIFICATION_EMAIL") || "jitenksony@gmail.com, pswelio@yahoo.com";

// Helper to get formatted recipient array
function getAdminRecipients(): string[] {
  return ADMIN_NOTIFICATION_EMAIL.split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

/**
 * Escapes unsafe HTML characters to prevent Email HTML Injection / XSS in mail clients.
 */
function escapeHtml(str?: string | number | null): string {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes headers to prevent CRLF injection attacks.
 */
function sanitizeHeader(str?: string): string {
  if (!str) return "";
  return String(str).replace(/[\r\n]+/g, " ").trim();
}

// Create reusable transporter object using Gmail SMTP
export const gmailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

// Create reusable transporter object using Yahoo SMTP
export const yahooTransporter = nodemailer.createTransport({
  service: "yahoo",
  auth: {
    user: YAHOO_USER,
    pass: YAHOO_APP_PASSWORD,
  },
});

/**
 * Robust dispatcher: attempts sending via primary provider (Yahoo/Gmail)
 * and automatically falls back to secondary provider if primary encounters an error.
 */
async function dispatchEmail(options: {
  subject: string;
  html: string;
  text?: string;
  recipients?: string[];
}) {
  const recipients = options.recipients && options.recipients.length > 0
    ? options.recipients
    : getAdminRecipients();

  const toHeader = recipients.join(", ");
  const cleanSubject = sanitizeHeader(options.subject);

  // Primary: Yahoo Transport (matches sender pswelio@yahoo.com)
  try {
    if (YAHOO_USER && YAHOO_APP_PASSWORD) {
      const info = await yahooTransporter.sendMail({
        from: `"Pool Supply Wholesalers" <${YAHOO_USER}>`,
        to: toHeader,
        subject: cleanSubject,
        html: options.html,
        text: options.text,
      });
      console.log(`[Email Service - Yahoo] Notification dispatched successfully. MessageId: ${info.messageId}`);
      return { success: true, provider: "yahoo", messageId: info.messageId };
    }
  } catch (yahooErr: any) {
    console.warn(`[Email Service - Yahoo] Failed, falling back to Gmail:`, yahooErr.message);
  }

  // Fallback: Gmail Transport (matches sender jitenksony@gmail.com)
  try {
    if (GMAIL_USER && GMAIL_APP_PASSWORD) {
      const info = await gmailTransporter.sendMail({
        from: `"Pool Supply Wholesalers" <${GMAIL_USER}>`,
        to: toHeader,
        subject: cleanSubject,
        html: options.html,
        text: options.text,
      });
      console.log(`[Email Service - Gmail Fallback] Notification dispatched successfully. MessageId: ${info.messageId}`);
      return { success: true, provider: "gmail", messageId: info.messageId };
    } else {
      throw new Error("No configured mail provider credentials found in environment variables.");
    }
  } catch (gmailErr: any) {
    console.error(`[Email Service] Both Yahoo and Gmail dispatchers failed:`, {
      gmail: gmailErr.message,
    });
    return { success: false, error: gmailErr.message };
  }
}

export interface SendOrderEmailPayload {
  id: string;
  placedAt: string;
  name: string;
  email: string;
  company?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  items: Array<{
    id?: string;
    name: string;
    brand?: string;
    price: number;
    qty: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  method?: string;
}

export async function sendNewOrderAdminNotification(order: SendOrderEmailPayload) {
  try {
    const formattedTotal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(order.total || 0);

    const formattedSubtotal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(order.subtotal || 0);

    const formattedShipping =
      order.shipping === 0
        ? "FREE (Standard / Freight)"
        : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(order.shipping);

    const formattedTax = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(order.tax || 0);

    const dateStr = new Date(order.placedAt || Date.now()).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const safeOrderId = escapeHtml(order.id);
    const safeCustomerName = escapeHtml(order.name);
    const safeCustomerEmail = escapeHtml(order.email);

    const itemsHtml = (order.items || [])
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 8px; font-weight: bold; color: #1e293b; font-size: 13px;">
            ${escapeHtml(item.name)}
            ${item.brand ? `<div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 2px;">Brand: ${escapeHtml(item.brand)}</div>` : ""}
          </td>
          <td style="padding: 12px 8px; text-align: center; color: #475569; font-size: 13px; font-weight: 600;">
            ${Number(item.qty) || 1}
          </td>
          <td style="padding: 12px 8px; text-align: right; color: #475569; font-size: 13px;">
            $${Number(item.price || 0).toFixed(2)}
          </td>
          <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #0f172a; font-size: 13px;">
            $${(Number(item.price || 0) * Number(item.qty || 1)).toFixed(2)}
          </td>
        </tr>`
      )
      .join("");

    const addressText = order.address
      ? `${order.address.line1 || ""}, ${order.address.city || ""}, ${order.address.state || ""} ${order.address.zip || ""}, ${order.address.country || "United States"}`
      : "Not Provided / Pickup";
    const safeAddressText = escapeHtml(addressText);

    const mailOptions = {
      subject: `🚨 New Order Received #${order.id} — ${formattedTotal} from ${order.name}`,
      text: `New Wholesale Order #${order.id}\nCustomer: ${order.name}\nEmail: ${order.email}\nTotal: ${formattedTotal}\nAddress: ${addressText}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order #${safeOrderId}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 0;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                
                <!-- HEADER BANNER -->
                <tr>
                  <td style="background: linear-gradient(135deg, #061220 0%, #091f38 50%, #040d1a 100%); padding: 32px 28px; text-align: left; border-bottom: 2px solid #0089C9;">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #59D2F3; margin-bottom: 6px;">
                      ⚡ Real-Time Wholesale Order Notification
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">
                      New Customer Order Placed
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">
                      Order ID: <strong style="color: #ffffff; font-family: monospace;">#${safeOrderId}</strong> · Placed on ${escapeHtml(dateStr)}
                    </p>
                  </td>
                </tr>

                <!-- HIGHLIGHT SUMMARY HUD -->
                <tr>
                  <td style="padding: 24px 28px 12px 28px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="padding: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-right: 8px;">
                          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b;">Total Amount Paid</div>
                          <div style="font-size: 22px; font-weight: 900; color: #0284c7; margin-top: 4px;">${formattedTotal}</div>
                        </td>
                        <td width="8"></td>
                        <td width="50%" style="padding: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
                          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b;">Fulfillment Status</div>
                          <div style="font-size: 14px; font-weight: 800; color: #059669; margin-top: 6px;">
                            <span style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 6px;">Pending Dispatch</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CUSTOMER & SHIPPING INFORMATION -->
                <tr>
                  <td style="padding: 12px 28px;">
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px;">
                      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 10px;">
                        Customer & Shipping Information
                      </div>
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #334155;">
                        <tr>
                          <td style="padding: 4px 0; width: 120px; font-weight: bold; color: #64748b;">Customer Name:</td>
                          <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${safeCustomerName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Email Address:</td>
                          <td style="padding: 4px 0;"><a href="mailto:${safeCustomerEmail}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${safeCustomerEmail}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Delivery Address:</td>
                          <td style="padding: 4px 0; font-weight: 600; color: #334155;">${safeAddressText}</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- ITEMIZED ITEMS BREAKDOWN -->
                <tr>
                  <td style="padding: 12px 28px 24px 28px;">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 12px;">
                      Order Line Items (${order.items?.length || 0})
                    </div>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                      <thead>
                        <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                          <th style="padding: 8px; text-align: left; font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase;">Item Description</th>
                          <th style="padding: 8px; text-align: center; font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase; width: 40px;">Qty</th>
                          <th style="padding: 8px; text-align: right; font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase; width: 80px;">Price</th>
                          <th style="padding: 8px; text-align: right; font-size: 11px; font-weight: bold; color: #475569; text-transform: uppercase; width: 80px;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    <!-- TOTALS BREAKDOWN -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 16px; border-top: 2px solid #e2e8f0; padding-top: 12px; font-size: 13px;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Subtotal</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #334155;">${formattedSubtotal}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Freight Shipping</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #334155;">${formattedShipping}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; color: #64748b; font-weight: 600;">Estimated Tax</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #334155;">${formattedTax}</td>
                      </tr>
                      <tr style="border-top: 1px solid #cbd5e1;">
                        <td style="padding: 10px 0; font-size: 15px; font-weight: 900; color: #0f172a;">Grand Total</td>
                        <td style="padding: 10px 0; text-align: right; font-size: 18px; font-weight: 900; color: #0284c7;">${formattedTotal}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- ACTION BUTTON -->
                <tr>
                  <td align="center" style="padding: 0 28px 32px 28px;">
                    <a href="https://poolsupplywholesalers.com/admin/orders" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 800; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(2,132,199,0.35); text-transform: uppercase; letter-spacing: 0.5px;">
                      Open Order in Admin Dashboard →
                    </a>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 11px; color: #94a3b8;">
                    Pool Supply Wholesalers Automated Telemetry Notification · Delivered to ${escapeHtml(getAdminRecipients().join(", "))}
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    };

    const result = await dispatchEmail(mailOptions);
    return result;
  } catch (error: any) {
    console.error("[Email Service] Error preparing order notification email:", error);
    return { success: false, error: error.message };
  }
}

export interface SendContactEmailPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  id?: string;
}

export async function sendContactEmailAdminNotification(contact: SendContactEmailPayload) {
  try {
    const dateStr = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const safeName = escapeHtml(contact.name);
    const safeEmail = escapeHtml(contact.email);
    const safePhone = escapeHtml(contact.phone || "Not Provided");
    const safeSubject = escapeHtml(contact.subject || "General Inquiry");
    const safeMessage = escapeHtml(contact.message);
    const safeId = escapeHtml(contact.id);

    const mailOptions = {
      subject: `📬 New Web Inquiry: ${contact.subject || "General Inquiry"} — from ${contact.name}`,
      text: `New Contact Submission:\nName: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone || "N/A"}\nSubject: ${contact.subject || "General"}\nMessage: ${contact.message}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Inquiry from ${safeName}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 24px 0;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                
                <!-- HEADER BANNER -->
                <tr>
                  <td style="background: linear-gradient(135deg, #061220 0%, #091f38 50%, #040d1a 100%); padding: 32px 28px; text-align: left; border-bottom: 2px solid #0089C9;">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #59D2F3; margin-bottom: 6px;">
                      📩 Real-Time Web Desk Notification
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">
                      New Contact Form Inquiry
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">
                      Submitted on ${escapeHtml(dateStr)} ${safeId ? `· ID: <strong style="color: #ffffff;">#${safeId}</strong>` : ""}
                    </p>
                  </td>
                </tr>

                <!-- SENDER DETAILS -->
                <tr>
                  <td style="padding: 24px 28px 12px 28px;">
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px;">
                      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 10px;">
                        Sender Contact Details
                      </div>
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #334155;">
                        <tr>
                          <td style="padding: 4px 0; width: 120px; font-weight: bold; color: #64748b;">Full Name:</td>
                          <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${safeName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Email Address:</td>
                          <td style="padding: 4px 0;"><a href="mailto:${safeEmail}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${safeEmail}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Phone Number:</td>
                          <td style="padding: 4px 0; font-weight: 600; color: #334155;">${safePhone}</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; font-weight: bold; color: #64748b;">Subject / Dept:</td>
                          <td style="padding: 4px 0; font-weight: 700; color: #0284c7;">${safeSubject}</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- INQUIRY MESSAGE -->
                <tr>
                  <td style="padding: 12px 28px 24px 28px;">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 8px;">
                      Message Content
                    </div>
                    <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${safeMessage}</div>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center; font-size: 11px; color: #94a3b8;">
                    Pool Supply Wholesalers Automated Telemetry Notification · Delivered to ${escapeHtml(getAdminRecipients().join(", "))}
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    };

    const result = await dispatchEmail(mailOptions);
    return result;
  } catch (error: any) {
    console.error("[Email Service] Error preparing contact notification email:", error);
    return { success: false, error: error.message };
  }
}

