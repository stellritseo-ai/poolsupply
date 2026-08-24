import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import { ObjectId } from "mongodb";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

// Helper to safely get bcrypt or fallback
async function getBcrypt() {
  if (bcrypt && typeof bcrypt.hash === "function") return bcrypt;
  const mod = await import("bcryptjs");
  return mod.default || mod;
}

function normalizeIdentifier(raw: string) {
  const clean = raw.trim();
  const isEmail = clean.includes("@");
  return {
    raw: clean,
    isEmail,
    clean: isEmail ? clean.toLowerCase() : clean,
  };
}

function buildSearchCriteria(identifier: string) {
  const { isEmail, clean } = normalizeIdentifier(identifier);
  if (isEmail) {
    return {
      $or: [
        { email: clean },
        { email: { $regex: new RegExp(`^${clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
      ],
    };
  }
  return {
    $or: [{ phone: clean }, { identifier: clean }],
  };
}

// ── 1. Customer Registration ──────────────────────────────────────────────────
export const registerCustomer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      identifier: z.string().min(3, "Valid Email or Mobile Number required"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: false, error: "Database connection temporarily unavailable. Please try again." };
      }
      const customersCol = db.collection("customers");

      const { isEmail, clean } = normalizeIdentifier(data.identifier);
      const searchCriteria = buildSearchCriteria(clean);

      const existing = await customersCol.findOne(searchCriteria);
      if (existing) {
        return { success: false, error: "An account with this email or phone number already exists." };
      }

      const b = await getBcrypt();
      const hashedPassword = await b.hash(data.password, 10);

      const newCustomer: any = {
        name: data.name.trim(),
        password: hashedPassword,
        company: "",
        contractorId: "",
        addresses: [],
        cards: [],
        emailPrefs: {
          orderUpdates: true,
          freightTracking: true,
          promoAlerts: true,
          catalogDigest: false,
          invoiceReceipts: true,
        },
        wishlists: {
          "Default Wishlist": [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isEmail) {
        newCustomer.email = clean;
      } else {
        newCustomer.phone = clean;
      }

      const res = await customersCol.insertOne(newCustomer);

      // Create Admin Notification
      try {
        const notifsCol = db.collection("notifications");
        await notifsCol.insertOne({
          title: `New Customer Registration: ${data.name}`,
          message: `${data.name} created an account with ${clean}.`,
          type: "system",
          read: false,
          createdAt: new Date(),
        });
      } catch (notifErr) {
        console.warn("Could not insert notification for registration:", notifErr);
      }

      // Secure session token
      const token = crypto.randomBytes(32).toString("hex");

      return {
        success: true,
        token,
        user: {
          id: res.insertedId.toString(),
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
        },
      };
    } catch (e: any) {
      console.error("Registration Error:", e);
      return { success: false, error: e.message || "Failed to create account. Please try again." };
    }
  });

// ── 2. Customer Login ────────────────────────────────────────────────────────
export const loginCustomer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      identifier: z.string().min(3, "Email or Mobile Number is required"),
      password: z.string().min(1, "Password is required"),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: false, error: "Database connection temporarily unavailable. Please try again." };
      }
      const customersCol = db.collection("customers");

      const { clean } = normalizeIdentifier(data.identifier);
      const searchCriteria = buildSearchCriteria(clean);

      const user = await customersCol.findOne(searchCriteria);
      if (!user) {
        return { success: false, error: "No account found with this email or mobile number." };
      }

      const b = await getBcrypt();
      let isMatch = false;
      if (user.password) {
        try {
          isMatch = await b.compare(data.password, user.password);
        } catch {
          isMatch = false;
        }
        if (!isMatch && user.password === data.password) {
          isMatch = true;
          // Rehash legacy plain password
          const newHashed = await b.hash(data.password, 10);
          await customersCol.updateOne({ _id: user._id }, { $set: { password: newHashed } });
        }
      }

      if (!isMatch) {
        return { success: false, error: "Invalid email/phone or password." };
      }

      const token = crypto.randomBytes(32).toString("hex");

      return {
        success: true,
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      };
    } catch (e: any) {
      console.error("Login Error:", e);
      return { success: false, error: e.message || "Failed to log in. Please try again." };
    }
  });

// ── 3. Get Full Customer Account Data ─────────────────────────────────────────
export const getCustomerAccountDataDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ identifier: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const { clean, isEmail } = normalizeIdentifier(data.identifier);

      const defaultProfile = {
        name: isEmail ? clean.split("@")[0] : "Commercial Contractor",
        email: isEmail ? clean : "",
        phone: !isEmail ? clean : "",
        avatar: "",
        company: "",
        contractorId: "",
        addresses: [],
        cards: [],
        emailPrefs: {
          orderUpdates: true,
          freightTracking: true,
          promoAlerts: true,
          catalogDigest: false,
          invoiceReceipts: true,
        },
        wishlists: {
          "Default Wishlist": [],
        },
      };

      if (!db) {
        return {
          success: true,
          profile: defaultProfile,
          orders: [],
          returns: [],
          quotes: [],
        };
      }

      const customersCol = db.collection("customers");
      const ordersCol = db.collection("orders");
      const returnsCol = db.collection("returns");
      const quotesCol = db.collection("quotes");

      const searchCriteria = buildSearchCriteria(clean);
      const customerDoc = await customersCol.findOne(searchCriteria);

      const profile = customerDoc
        ? {
            id: customerDoc._id.toString(),
            name: customerDoc.name || defaultProfile.name,
            email: customerDoc.email || defaultProfile.email,
            phone: customerDoc.phone || defaultProfile.phone,
            avatar: customerDoc.avatar || "",
            company: customerDoc.company || "",
            contractorId: customerDoc.contractorId || "",
            addresses: customerDoc.addresses || [],
            cards: customerDoc.cards || [],
            emailPrefs: customerDoc.emailPrefs || defaultProfile.emailPrefs,
            wishlists: customerDoc.wishlists || defaultProfile.wishlists,
          }
        : defaultProfile;

      // Match orders
      const orderSearch: any = {
        $or: [
          { email: clean },
          { email: { $regex: new RegExp(`^${clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
          { phone: clean },
        ],
      };
      if (profile.email) orderSearch.$or.push({ email: profile.email });
      if (profile.phone) orderSearch.$or.push({ phone: profile.phone });

      const rawOrders = await ordersCol.find(orderSearch).sort({ placedAt: -1 }).toArray();
      const orders = rawOrders.map((o: any) => ({
        id: o.id || o._id.toString(),
        placedAt: o.placedAt || new Date().toISOString(),
        email: o.email,
        phone: o.phone,
        name: o.name,
        company: o.company,
        address: o.address,
        items: o.items || [],
        subtotal: o.subtotal || 0,
        shipping: o.shipping || 0,
        tax: o.tax || 0,
        total: o.total || 0,
        discount: o.discount,
        promoCode: o.promoCode,
        paymentType: o.paymentType || "Card",
        paymentStatus: o.paymentStatus || "Paid",
        status: o.status || "Pending",
        method: o.method || "standard",
      }));

      // Match returns
      const orderIds = orders.map((o: any) => o.id).filter(Boolean);
      const returnOrList: any[] = [
        { customerIdentifier: clean },
        { customerIdentifier: { $regex: new RegExp(`^${clean.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}$`, "i") } },
        { customerEmail: clean },
        { customerEmail: { $regex: new RegExp(`^${clean.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}$`, "i") } },
        { customerPhone: clean },
        { email: clean },
        { phone: clean },
      ];
      if (profile.email) {
        returnOrList.push({ customerIdentifier: profile.email });
        returnOrList.push({ customerEmail: profile.email });
      }
      if (profile.phone) {
        returnOrList.push({ customerIdentifier: profile.phone });
        returnOrList.push({ customerPhone: profile.phone });
      }
      if (orderIds.length > 0) {
        returnOrList.push({ orderId: { $in: orderIds } });
      }

      const rawReturns = await returnsCol.find({ $or: returnOrList }).sort({ createdAt: -1 }).toArray();
      const returns = rawReturns.map((r: any) => ({
        id: r._id.toString(),
        rmaId: r.rmaId || `RMA-${r._id.toString().slice(-6)}`,
        orderId: r.orderId,
        reason: r.reason,
        notes: r.notes,
        items: r.items || [],
        preferredResolution: r.preferredResolution || "Replacement Unit",
        status: r.status || "Under Review",
        isResolved: typeof r.isResolved === "boolean" ? r.isResolved : r.status === "Resolved",
        adminNotes: r.adminNotes || "",
        adminResolution: r.adminResolution || "",
        createdAt: r.createdAt || new Date().toISOString(),
      }));

      // Match quotes
      const quoteOrList: any[] = [
        { customerIdentifier: clean },
        { customerIdentifier: { $regex: new RegExp(`^${clean.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}$`, "i") } },
        { customerEmail: clean },
        { customerEmail: { $regex: new RegExp(`^${clean.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}$`, "i") } },
        { customerPhone: clean },
        { email: clean },
        { phone: clean },
      ];
      if (profile.email) {
        quoteOrList.push({ customerIdentifier: profile.email });
        quoteOrList.push({ customerEmail: profile.email });
      }
      if (profile.phone) {
        quoteOrList.push({ customerIdentifier: profile.phone });
        quoteOrList.push({ customerPhone: profile.phone });
      }

      const rawQuotes = await quotesCol.find({ $or: quoteOrList }).sort({ createdAt: -1 }).toArray();
      const quotes = rawQuotes.map((q: any) => ({
        id: q._id.toString(),
        quoteId: q.quoteId || `Q-${q._id.toString().slice(-5)}`,
        projectName: q.projectName || "Commercial Project",
        projectLocation: q.projectLocation || "",
        targetCompletionDate: q.targetCompletionDate || "Next 30 Days",
        estimatedBudget: typeof q.estimatedBudget === "number" ? q.estimatedBudget : 0,
        notes: q.notes || "",
        items: q.items || [],
        status: q.status || "Engineering Review",
        isResolved: typeof q.isResolved === "boolean" ? q.isResolved : q.status === "Resolved" || q.status === "Accepted" || q.status === "Converted to Order",
        quotedAmount: typeof q.quotedAmount === "number" ? q.quotedAmount : (typeof q.totalAmount === "number" ? q.totalAmount : 0),
        totalAmount: typeof q.quotedAmount === "number" ? q.quotedAmount : (typeof q.totalAmount === "number" ? q.totalAmount : 0),
        adminLeadTime: q.adminLeadTime || "",
        adminFreightTerms: q.adminFreightTerms || "",
        adminNotes: q.adminNotes || "",
        adminProposalNotes: q.adminProposalNotes || "",
        createdAt: q.createdAt || new Date().toISOString(),
      }));

      return {
        success: true,
        profile,
        orders,
        returns,
        quotes,
      };
    } catch (e: any) {
      console.error("Get Customer Account Data Error:", e);
      return {
        success: false,
        error: "Failed to load account data.",
      };
    }
  });

// ── 4. Update Profile ─────────────────────────────────────────────────────────
export const updateCustomerProfileDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      identifier: z.string(),
      name: z.string().optional(),
      company: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      contractorId: z.string().optional(),
      avatar: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const customersCol = db.collection("customers");

      const { clean } = normalizeIdentifier(data.identifier);
      const searchCriteria = buildSearchCriteria(clean);

      const updates: any = { updatedAt: new Date() };
      if (data.name !== undefined) updates.name = data.name.trim();
      if (data.company !== undefined) updates.company = data.company.trim();
      if (data.phone !== undefined) updates.phone = data.phone.trim();
      if (data.email !== undefined) updates.email = data.email.trim().toLowerCase();
      if (data.contractorId !== undefined) updates.contractorId = data.contractorId.trim();
      if (data.avatar !== undefined) updates.avatar = data.avatar.trim();

      await customersCol.updateOne(searchCriteria, { $set: updates }, { upsert: true });

      return { success: true };
    } catch (e: any) {
      console.error("Update Customer Profile Error:", e);
      return { success: false, error: "Failed to update profile." };
    }
  });

// ── 4b. Upload Profile Avatar to Cloudinary & Sync with DB ───────────────────
export const uploadCustomerAvatarDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      identifier: z.string(),
      fileData: z.string(), // base64 or remote URL
    })
  )
  .handler(async ({ data }) => {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || "dmanafb84";
      const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET || "pool_uploads";

      const formData = new URLSearchParams();
      formData.append("file", data.fileData);
      formData.append("upload_preset", uploadPreset);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const cloudJson = await cloudRes.json();

      if (!cloudRes.ok || !cloudJson.secure_url) {
        console.error("Cloudinary upload error:", cloudJson);
        return {
          success: false,
          error: cloudJson?.error?.message || "Failed to upload image to Cloudinary.",
        };
      }

      const avatarUrl = cloudJson.secure_url;

      // Sync avatar URL with customer profile in MongoDB
      const db = await connectDB();
      if (db) {
        const customersCol = db.collection("customers");
        const { clean } = normalizeIdentifier(data.identifier);
        const searchCriteria = buildSearchCriteria(clean);

        await customersCol.updateOne(
          searchCriteria,
          { $set: { avatar: avatarUrl, updatedAt: new Date() } },
          { upsert: true }
        );
      }

      return {
        success: true,
        avatarUrl,
      };
    } catch (e: any) {
      console.error("Upload Customer Avatar Error:", e);
      return {
        success: false,
        error: e.message || "Failed to upload avatar image.",
      };
    }
  });

// ── 5. Update Password ────────────────────────────────────────────────────────
export const updateCustomerPasswordDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      identifier: z.string(),
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const customersCol = db.collection("customers");

      const { clean } = normalizeIdentifier(data.identifier);
      const searchCriteria = buildSearchCriteria(clean);

      const user = await customersCol.findOne(searchCriteria);
      if (!user) return { success: false, error: "Account not found." };

      const b = await getBcrypt();
      let isMatch = false;
      if (user.password) {
        try {
          isMatch = await b.compare(data.currentPassword, user.password);
        } catch {
          isMatch = false;
        }
        if (!isMatch && user.password === data.currentPassword) {
          isMatch = true;
        }
      }

      if (!isMatch) {
        return { success: false, error: "Current password is incorrect." };
      }

      const hashedPassword = await b.hash(data.newPassword, 10);
      await customersCol.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );

      return { success: true };
    } catch (e: any) {
      console.error("Update Customer Password Error:", e);
      return { success: false, error: "Failed to change password." };
    }
  });

// ── 6. Address Book ───────────────────────────────────────────────────────────
export const saveCustomerAddressDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      identifier: z.string(),
      address: z.any(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const customersCol = db.collection("customers");

      const { clean } = normalizeIdentifier(data.identifier);
      const searchCriteria = buildSearchCriteria(clean);

      const user = await customersCol.findOne(searchCriteria);
      if (!user) return { success: false, error: "Account not found." };

      const existingAddresses: any[] = user.addresses || [];
      const newAddress = {
        ...data.address,
        id: data.address.id || `addr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };

      let updatedAddresses: any[];
      if (newAddress.isDefault) {
        updatedAddresses = existingAddresses.map((a) => ({ ...a, isDefault: false }));
      } else {
        updatedAddresses = [...existingAddresses];
      }

      const existingIndex = updatedAddresses.findIndex((a) => a.id === newAddress.id);
      if (existingIndex >= 0) {
        updatedAddresses[existingIndex] = newAddress;
      } else {
        updatedAddresses.push(newAddress);
      }

      await customersCol.updateOne(
        { _id: user._id },
        { $set: { addresses: updatedAddresses, updatedAt: new Date() } }
      );

      return { success: true };
    } catch (e: any) {
      console.error("Save Customer Address Error:", e);
      return { success: false, error: "Failed to save address." };
    }
  });

export const deleteCustomerAddressDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      identifier: z.string(),
      addressId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const customersCol = db.collection("customers");

      const { clean } = normalizeIdentifier(data.identifier);
      const searchCriteria = buildSearchCriteria(clean);

      await customersCol.updateOne(searchCriteria, {
        $pull: { addresses: { id: data.addressId } } as any,
        $set: { updatedAt: new Date() },
      });

      return { success: true };
    } catch (e: any) {
      console.error("Delete Customer Address Error:", e);
      return { success: false, error: "Failed to delete address." };
    }
  });

// ── 7. Payment Cards ──────────────────────────────────────────────────────────
export const saveCustomerCardDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      identifier: z.string(),
      card: z.any(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const customersCol = db.collection("customers");

      const { clean } = normalizeIdentifier(data.identifier);
      const searchCriteria = buildSearchCriteria(clean);

      const user = await customersCol.findOne(searchCriteria);
      if (!user) return { success: false, error: "Account not found." };

      const existingCards: any[] = user.cards || [];
      const newCard = {
        ...data.card,
        id: data.card.id || `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };

      let updatedCards: any[];
      if (newCard.isDefault) {
        updatedCards = existingCards.map((c) => ({ ...c, isDefault: false }));
      } else {
        updatedCards = [...existingCards];
      }

      const existingIndex = updatedCards.findIndex((c) => c.id === newCard.id);
      if (existingIndex >= 0) {
        updatedCards[existingIndex] = newCard;
      } else {
        updatedCards.push(newCard);
      }

      await customersCol.updateOne(
        { _id: user._id },
        { $set: { cards: updatedCards, updatedAt: new Date() } }
      );

      return { success: true };
    } catch (e: any) {
      console.error("Save Customer Card Error:", e);
      return { success: false, error: "Failed to save card." };
    }
  });

export const deleteCustomerCardDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      identifier: z.string(),
      cardId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const customersCol = db.collection("customers");

      const { clean } = normalizeIdentifier(data.identifier);
      const searchCriteria = buildSearchCriteria(clean);

      await customersCol.updateOne(searchCriteria, {
        $pull: { cards: { id: data.cardId } } as any,
        $set: { updatedAt: new Date() },
      });

      return { success: true };
    } catch (e: any) {
      console.error("Delete Customer Card Error:", e);
      return { success: false, error: "Failed to delete payment card." };
    }
  });

// ── 8. Email Preferences ──────────────────────────────────────────────────────
export const updateCustomerEmailPrefsDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      identifier: z.string(),
      prefs: z.any(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const customersCol = db.collection("customers");

      const { clean } = normalizeIdentifier(data.identifier);
      const searchCriteria = buildSearchCriteria(clean);

      await customersCol.updateOne(
        searchCriteria,
        { $set: { emailPrefs: data.prefs, updatedAt: new Date() } },
        { upsert: true }
      );

      return { success: true };
    } catch (e: any) {
      console.error("Update Email Prefs Error:", e);
      return { success: false, error: "Failed to update email preferences." };
    }
  });

// ── 9. Wishlists ──────────────────────────────────────────────────────────────
export const updateCustomerWishlistsDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      identifier: z.string(),
      wishlists: z.any(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const customersCol = db.collection("customers");

      const { clean } = normalizeIdentifier(data.identifier);
      const searchCriteria = buildSearchCriteria(clean);

      await customersCol.updateOne(
        searchCriteria,
        { $set: { wishlists: data.wishlists, updatedAt: new Date() } },
        { upsert: true }
      );

      return { success: true };
    } catch (e: any) {
      console.error("Update Customer Wishlists Error:", e);
      return { success: false, error: "Failed to save wishlists." };
    }
  });

// ── 10. Returns & RMA Requests ────────────────────────────────────────────────
export const createReturnRequestDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      customerIdentifier: z.string(),
      customerName: z.string().optional(),
      customerEmail: z.string().optional(),
      customerPhone: z.string().optional(),
      customerCompany: z.string().optional(),
      orderId: z.string(),
      orderTotal: z.number().optional(),
      orderPlacedAt: z.string().optional(),
      reason: z.string(),
      notes: z.string().optional(),
      items: z.array(z.any()).optional(),
      preferredResolution: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false as const, error: "Database unavailable." };
      const returnsCol = db.collection("returns");
      const notifsCol = db.collection("notifications");
      const ordersCol = db.collection("orders");

      let orderTotal = data.orderTotal;
      let orderPlacedAt = data.orderPlacedAt;
      let items = data.items || [];

      if (!orderTotal || items.length === 0) {
        try {
          const cleanOrderId = data.orderId.trim();
          const orderDoc = await ordersCol.findOne({
            $or: [
              { id: cleanOrderId },
              { id: { $regex: new RegExp(`^${cleanOrderId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } }
            ]
          });
          if (orderDoc) {
            orderTotal = orderTotal ?? orderDoc.total;
            orderPlacedAt = orderPlacedAt ?? orderDoc.placedAt;
            if (items.length === 0 && orderDoc.items) {
              items = orderDoc.items;
            }
          }
        } catch (err) {
          console.warn("Could not lookup order for RMA enrichment:", err);
        }
      }

      const rmaId = `RMA-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toISOString();

      const doc = {
        rmaId,
        customerIdentifier: data.customerIdentifier.trim(),
        customerName: data.customerName?.trim() || "Commercial Client",
        customerEmail: data.customerEmail?.trim() || (data.customerIdentifier.includes("@") ? data.customerIdentifier.trim() : ""),
        customerPhone: data.customerPhone?.trim() || (!data.customerIdentifier.includes("@") ? data.customerIdentifier.trim() : ""),
        customerCompany: data.customerCompany?.trim() || "",
        orderId: data.orderId.trim(),
        orderTotal: orderTotal || 0,
        orderPlacedAt: orderPlacedAt || now,
        reason: data.reason,
        notes: data.notes || "",
        items,
        preferredResolution: data.preferredResolution || "Replacement Unit",
        status: "Under Review" as const,
        isResolved: false,
        adminNotes: "",
        adminResolution: "",
        createdAt: now,
        updatedAt: now,
      };

      await returnsCol.insertOne(doc);

      try {
        await notifsCol.insertOne({
          title: `New Return / RMA Request: ${rmaId}`,
          message: `Return submitted for Order #${data.orderId} (${data.reason}).`,
          type: "return",
          read: false,
          createdAt: new Date(),
        });
      } catch (err) {
        console.warn("Could not insert notification for RMA:", err);
      }

      return { success: true, rmaId };
    } catch (e: any) {
      console.error("Create Return Request Error:", e);
      return { success: false, error: "Failed to submit return request." };
    }
  });

// ── 11. Engineering Quote Requests ────────────────────────────────────────────
export const createQuoteRequestDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      customerIdentifier: z.string(),
      projectName: z.string(),
      targetCompletionDate: z.string().optional(),
      notes: z.string().optional(),
      items: z.array(z.any()).optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const quotesCol = db.collection("quotes");
      const notifsCol = db.collection("notifications");

      const quoteId = `Q-${Math.floor(10000 + Math.random() * 90000)}`;
      const doc = {
        quoteId,
        customerIdentifier: data.customerIdentifier.trim(),
        projectName: data.projectName.trim(),
        targetCompletionDate: data.targetCompletionDate || "Next 30 Days",
        notes: data.notes || "",
        items: data.items || [],
        status: "Engineering Review",
        createdAt: new Date().toISOString(),
      };

      await quotesCol.insertOne(doc);

      try {
        await notifsCol.insertOne({
          title: `New Commercial Quote Request: #${quoteId}`,
          message: `Project "${data.projectName}" submitted by ${data.customerIdentifier}.`,
          type: "order",
          read: false,
          createdAt: new Date(),
        });
      } catch (err) {
        console.warn("Could not insert notification for quote:", err);
      }

      return { success: true, quoteId };
    } catch (e: any) {
      console.error("Create Quote Request Error:", e);
      return { success: false, error: "Failed to submit quote request." };
    }
  });

// ── 12. Legacy Orders and Admin Helpers ────────────────────────────────────────
export const getCustomerOrders = createServerFn({ method: "POST" })
  .inputValidator(z.object({ identifier: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: true, orders: [] };
      const ordersCol = db.collection("orders");

      const { clean } = normalizeIdentifier(data.identifier);
      const searchCriteria = buildSearchCriteria(clean);

      const orders = await ordersCol.find(searchCriteria).sort({ placedAt: -1 }).toArray();

      const formatted = orders.map((o) => ({
        id: o.id || o._id.toString(),
        placedAt: o.placedAt || new Date().toISOString(),
        email: o.email,
        phone: o.phone,
        name: o.name,
        items: o.items || [],
        subtotal: o.subtotal,
        shipping: o.shipping,
        tax: o.tax,
        total: o.total,
        status: o.status || "Pending",
        method: o.method || "standard",
      }));

      return { success: true, orders: formatted };
    } catch (e: any) {
      console.error("Fetch Orders Error:", e);
      return { success: false, error: "Failed to fetch orders." };
    }
  });

export const getAdminCustomers = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) return { success: true, customers: [] };
      const customersCol = db.collection("customers");
      const ordersCol = db.collection("orders");
      const returnsCol = db.collection("returns");
      const quotesCol = db.collection("quotes");

      const [customers, orders, returns, quotes] = await Promise.all([
        customersCol.find().sort({ createdAt: -1 }).toArray(),
        ordersCol.find().sort({ placedAt: -1 }).toArray(),
        returnsCol.find().sort({ createdAt: -1 }).toArray(),
        quotesCol.find().sort({ createdAt: -1 }).toArray(),
      ]);

      const customersWithStats = customers.map((c) => {
        const emailClean = c.email?.toLowerCase().trim();
        const phoneClean = c.phone?.trim();

        // Match orders
        const customerOrders = orders.filter((o) => {
          if (emailClean && o.email?.toLowerCase().trim() === emailClean) return true;
          if (phoneClean && o.phone?.trim() === phoneClean) return true;
          if (phoneClean && o.email?.trim() === phoneClean) return true;
          return false;
        }).map((o: any) => ({
          id: o.id || o._id.toString(),
          placedAt: o.placedAt || new Date().toISOString(),
          email: o.email,
          phone: o.phone,
          name: o.name,
          company: o.company,
          address: o.address,
          items: o.items || [],
          subtotal: o.subtotal || 0,
          shipping: o.shipping || 0,
          tax: o.tax || 0,
          total: o.total || 0,
          discount: o.discount,
          promoCode: o.promoCode,
          paymentType: o.paymentType || "Card",
          paymentStatus: o.paymentStatus || "Paid",
          status: o.status || "Pending",
          method: o.method || "standard",
        }));

        // Match returns
        const customerReturns = returns.filter((r) => {
          if (emailClean && (r.customerEmail?.toLowerCase() === emailClean || r.customerIdentifier?.toLowerCase() === emailClean)) return true;
          if (phoneClean && (r.customerPhone === phoneClean || r.customerIdentifier === phoneClean)) return true;
          if (customerOrders.some((o) => o.id === r.orderId)) return true;
          return false;
        }).map((r: any) => ({
          id: r._id.toString(),
          rmaId: r.rmaId || `RMA-${r._id.toString().slice(-6)}`,
          orderId: r.orderId,
          reason: r.reason || "General Return",
          notes: r.notes || "",
          items: r.items || [],
          preferredResolution: r.preferredResolution || "Replacement Unit",
          status: r.status || "Under Review",
          isResolved: typeof r.isResolved === "boolean" ? r.isResolved : r.status === "Resolved",
          adminNotes: r.adminNotes || "",
          adminResolution: r.adminResolution || "",
          createdAt: r.createdAt || new Date().toISOString(),
        }));

        // Match quotes
        const customerQuotes = quotes.filter((q) => {
          if (emailClean && (q.customerEmail?.toLowerCase() === emailClean || q.customerIdentifier?.toLowerCase() === emailClean)) return true;
          if (phoneClean && (q.customerPhone === phoneClean || q.customerIdentifier === phoneClean)) return true;
          return false;
        }).map((q: any) => ({
          id: q._id.toString(),
          quoteId: q.quoteId || `Q-${q._id.toString().slice(-5)}`,
          projectName: q.projectName || "Commercial Project",
          projectLocation: q.projectLocation || "",
          targetCompletionDate: q.targetCompletionDate || "Next 30 Days",
          estimatedBudget: typeof q.estimatedBudget === "number" ? q.estimatedBudget : 0,
          notes: q.notes || "",
          items: q.items || [],
          status: q.status || "Engineering Review",
          isResolved: typeof q.isResolved === "boolean" ? q.isResolved : q.status === "Resolved" || q.status === "Accepted" || q.status === "Converted to Order",
          quotedAmount: typeof q.quotedAmount === "number" ? q.quotedAmount : (typeof q.totalAmount === "number" ? q.totalAmount : 0),
          adminLeadTime: q.adminLeadTime || "",
          adminFreightTerms: q.adminFreightTerms || "",
          adminNotes: q.adminNotes || "",
          adminProposalNotes: q.adminProposalNotes || "",
          createdAt: q.createdAt || new Date().toISOString(),
        }));

        const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const totalProductsPurchased = customerOrders.reduce((sum, o) => {
          return sum + (o.items || []).reduce((itemSum: number, item: any) => itemSum + (item.qty || 1), 0);
        }, 0);

        return {
          id: c._id.toString(),
          name: c.name || "Commercial Customer",
          email: c.email || undefined,
          phone: c.phone || undefined,
          avatar: c.avatar || undefined,
          company: c.company || undefined,
          contractorId: c.contractorId || undefined,
          addresses: c.addresses || [],
          cards: c.cards || [],
          emailPrefs: c.emailPrefs || {
            orderUpdates: true,
            freightTracking: true,
            promoAlerts: true,
            catalogDigest: false,
            invoiceReceipts: true,
          },
          wishlists: c.wishlists || {},
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || c.createdAt || new Date().toISOString(),
          totalOrders: customerOrders.length,
          lifetimeValue: totalSpent,
          totalSpent,
          totalItems: totalProductsPurchased,
          totalProductsPurchased,
          orders: customerOrders,
          returns: customerReturns,
          quotes: customerQuotes,
        };
      });

      return { success: true, customers: customersWithStats };
    } catch (e: any) {
      console.error("Fetch Customers Error:", e);
      return { success: false, error: "Failed to fetch customers data.", customers: [] };
    }
  });

export const getAdminCustomerDetailsDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const customersCol = db.collection("customers");
      const ordersCol = db.collection("orders");
      const returnsCol = db.collection("returns");
      const quotesCol = db.collection("quotes");

      let customerDoc: any = null;
      try {
        if (ObjectId.isValid(data.id)) {
          customerDoc = await customersCol.findOne({ _id: new ObjectId(data.id) });
        }
      } catch {}

      if (!customerDoc) {
        customerDoc = await customersCol.findOne({
          $or: [{ email: data.id }, { phone: data.id }, { name: data.id }],
        });
      }

      if (!customerDoc) {
        return { success: false, error: "Customer not found." };
      }

      const emailClean = customerDoc.email?.toLowerCase().trim();
      const phoneClean = customerDoc.phone?.trim();

      const [orders, returns, quotes] = await Promise.all([
        ordersCol.find().sort({ placedAt: -1 }).toArray(),
        returnsCol.find().sort({ createdAt: -1 }).toArray(),
        quotesCol.find().sort({ createdAt: -1 }).toArray(),
      ]);

      const customerOrders = orders
        .filter((o) => {
          if (emailClean && o.email?.toLowerCase().trim() === emailClean) return true;
          if (phoneClean && o.phone?.trim() === phoneClean) return true;
          if (phoneClean && o.email?.trim() === phoneClean) return true;
          return false;
        })
        .map((o: any) => ({
          id: o.id || o._id?.toString() || "",
          placedAt: o.placedAt || new Date().toISOString(),
          email: o.email || "",
          phone: o.phone || "",
          name: o.name || "",
          company: o.company || "",
          address: o.address || {},
          items: o.items || [],
          subtotal: o.subtotal || 0,
          shipping: o.shipping || 0,
          tax: o.tax || 0,
          total: o.total || 0,
          status: o.status || "Pending",
          method: o.method || "freight",
          paymentType: o.paymentType || "Card",
          paymentStatus: o.paymentStatus || "Paid",
        }));

      const customerReturns = returns
        .filter((r) => {
          if (emailClean && (r.customerEmail?.toLowerCase() === emailClean || r.customerIdentifier?.toLowerCase() === emailClean)) return true;
          if (phoneClean && (r.customerPhone === phoneClean || r.customerIdentifier === phoneClean)) return true;
          if (customerOrders.some((o) => o.id === r.orderId)) return true;
          return false;
        })
        .map((r: any) => ({
          id: r.id || r.returnId || r._id?.toString() || "",
          returnId: r.returnId || r.id || r._id?.toString() || "",
          orderId: r.orderId || "",
          customerName: r.customerName || "",
          customerEmail: r.customerEmail || "",
          customerPhone: r.customerPhone || "",
          itemSku: r.itemSku || "",
          itemName: r.itemName || "",
          reason: r.reason || "",
          preferredResolution: r.preferredResolution || "",
          comments: r.comments || "",
          status: r.status || "Pending Review",
          isResolved: Boolean(r.isResolved),
          adminNotes: r.adminNotes || "",
          createdAt: r.createdAt || new Date().toISOString(),
        }));

      const customerQuotes = quotes
        .filter((q) => {
          if (emailClean && (q.customerEmail?.toLowerCase() === emailClean || q.customerIdentifier?.toLowerCase() === emailClean)) return true;
          if (phoneClean && (q.customerPhone === phoneClean || q.customerIdentifier === phoneClean)) return true;
          return false;
        })
        .map((q: any) => ({
          id: q.id || q.quoteId || q._id?.toString() || "",
          quoteId: q.quoteId || q.id || q._id?.toString() || "",
          customerName: q.customerName || "",
          customerEmail: q.customerEmail || "",
          customerPhone: q.customerPhone || "",
          company: q.company || "",
          contractorId: q.contractorId || "",
          targetCompletionDate: q.targetCompletionDate || "",
          projectLocation: q.projectLocation || "",
          estimatedBudget: q.estimatedBudget || 0,
          notes: q.notes || "",
          status: q.status || "Engineering Review",
          isResolved: Boolean(q.isResolved),
          adminQuotedAmount: q.adminQuotedAmount || 0,
          adminLeadTime: q.adminLeadTime || "",
          adminFreightTerms: q.adminFreightTerms || "",
          adminNotes: q.adminNotes || "",
          adminProposalNotes: q.adminProposalNotes || "",
          createdAt: q.createdAt || new Date().toISOString(),
        }));

      const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalProductsPurchased = customerOrders.reduce((sum, o) => {
        return sum + (o.items || []).reduce((itemSum: number, item: any) => itemSum + (item.qty || 1), 0);
      }, 0);

      return {
        success: true,
        customer: {
          id: customerDoc._id.toString(),
          name: customerDoc.name || "Commercial Customer",
          email: customerDoc.email,
          phone: customerDoc.phone,
          company: customerDoc.company,
          contractorId: customerDoc.contractorId,
          addresses: customerDoc.addresses || [],
          cards: customerDoc.cards || [],
          emailPrefs: customerDoc.emailPrefs,
          wishlists: customerDoc.wishlists || {},
          createdAt: customerDoc.createdAt,
          updatedAt: customerDoc.updatedAt,
          totalOrders: customerOrders.length,
          lifetimeValue: totalSpent,
          totalItems: totalProductsPurchased,
          orders: customerOrders,
          returns: customerReturns,
          quotes: customerQuotes,
        },
      };
    } catch (e: any) {
      console.error("Fetch Customer Details Error:", e);
      return { success: false, error: "Failed to fetch customer details." };
    }
  });

