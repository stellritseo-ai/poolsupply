import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import { ObjectId } from "mongodb";

export interface QuoteItem {
  id?: string;
  name: string;
  brand?: string;
  price?: number;
  qty: number;
  img?: string;
  sku?: string;
}

export interface QuoteRequest {
  id: string;
  quoteId: string;
  customerIdentifier: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  customerContractorId: string;
  projectName: string;
  projectLocation?: string;
  targetCompletionDate: string;
  estimatedBudget?: number;
  notes: string;
  items: QuoteItem[];
  status:
    | "Under Review"
    | "Engineering Review"
    | "Pricing Ready"
    | "Approved"
    | "Accepted"
    | "Rejected"
    | "Resolved"
    | "Converted to Order"
    | "Cancelled";
  isResolved: boolean;
  quotedAmount?: number;
  adminLeadTime?: string;
  adminFreightTerms?: string;
  adminNotes?: string;
  adminProposalNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

function toObjectId(idStr: string): any {
  try {
    if (ObjectId.isValid(idStr)) {
      return new ObjectId(idStr);
    }
  } catch {
    // ignore
  }
  return idStr;
}

// ── 1. Create Quote Request (Customer or Admin) ─────────────────────────────
export const createQuoteRequestDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      customerIdentifier: z.string(),
      customerName: z.string().optional(),
      customerEmail: z.string().optional(),
      customerPhone: z.string().optional(),
      customerCompany: z.string().optional(),
      customerContractorId: z.string().optional(),
      projectName: z.string(),
      projectLocation: z.string().optional(),
      targetCompletionDate: z.string().optional(),
      estimatedBudget: z.number().optional(),
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
      const now = new Date().toISOString();

      const doc = {
        quoteId,
        customerIdentifier: data.customerIdentifier.trim(),
        customerName: data.customerName?.trim() || "Trade Client",
        customerEmail: data.customerEmail?.trim() || (data.customerIdentifier.includes("@") ? data.customerIdentifier.trim() : ""),
        customerPhone: data.customerPhone?.trim() || (!data.customerIdentifier.includes("@") ? data.customerIdentifier.trim() : ""),
        customerCompany: data.customerCompany?.trim() || "",
        customerContractorId: data.customerContractorId?.trim() || "",
        projectName: data.projectName.trim(),
        projectLocation: data.projectLocation?.trim() || "",
        targetCompletionDate: data.targetCompletionDate || "Next 30 Days",
        estimatedBudget: data.estimatedBudget || 0,
        notes: data.notes || "",
        items: data.items || [],
        status: "Engineering Review" as const,
        isResolved: false,
        quotedAmount: 0,
        adminLeadTime: "3-5 Business Days",
        adminFreightTerms: "FOB Nashville / Wholesale Freight",
        adminNotes: "",
        adminProposalNotes: "",
        createdAt: now,
        updatedAt: now,
      };

      const result = await quotesCol.insertOne(doc);

      try {
        await notifsCol.insertOne({
          title: `New Commercial Quote Request: #${quoteId}`,
          message: `Project "${data.projectName}" submitted by ${doc.customerName} (${doc.customerEmail || doc.customerIdentifier}).`,
          type: "quote",
          read: false,
          createdAt: new Date(),
        });
      } catch (err) {
        console.warn("Could not insert notification for quote:", err);
      }

      return {
        success: true,
        quoteId,
        id: result.insertedId.toString(),
      };
    } catch (e: any) {
      console.error("Create Quote Request Error:", e);
      return { success: false, error: "Failed to submit quote request." };
    }
  });

// ── 2. Get All Quote Requests (Admin) ───────────────────────────────────────
export const getAdminQuotesDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) return { success: true, quotes: [] as QuoteRequest[] };
      const quotesCol = db.collection("quotes");

      const rawQuotes = await quotesCol.find().sort({ createdAt: -1 }).toArray();

      const quotes: QuoteRequest[] = rawQuotes.map((q: any) => ({
        id: q._id.toString(),
        quoteId: q.quoteId || `Q-${q._id.toString().slice(-5)}`,
        customerIdentifier: q.customerIdentifier || "",
        customerName: q.customerName || "Trade Client",
        customerEmail: q.customerEmail || "",
        customerPhone: q.customerPhone || "",
        customerCompany: q.customerCompany || "",
        customerContractorId: q.customerContractorId || "",
        projectName: q.projectName || "Commercial Installation",
        projectLocation: q.projectLocation || "",
        targetCompletionDate: q.targetCompletionDate || "Next 30 Days",
        estimatedBudget: typeof q.estimatedBudget === "number" ? q.estimatedBudget : 0,
        notes: q.notes || "",
        items: Array.isArray(q.items) ? q.items : [],
        status: q.status || "Engineering Review",
        isResolved: typeof q.isResolved === "boolean" ? q.isResolved : q.status === "Resolved" || q.status === "Accepted" || q.status === "Converted to Order",
        quotedAmount: typeof q.quotedAmount === "number" ? q.quotedAmount : (typeof q.totalAmount === "number" ? q.totalAmount : 0),
        adminLeadTime: q.adminLeadTime || "",
        adminFreightTerms: q.adminFreightTerms || "",
        adminNotes: q.adminNotes || "",
        adminProposalNotes: q.adminProposalNotes || "",
        createdAt: q.createdAt || new Date().toISOString(),
        updatedAt: q.updatedAt || q.createdAt,
        resolvedAt: q.resolvedAt,
      }));

      return { success: true, quotes };
    } catch (e: any) {
      console.error("Get Admin Quotes Error:", e);
      return { success: false, error: "Failed to fetch quotes data.", quotes: [] as QuoteRequest[] };
    }
  });

// ── 3. Update Quote Status, Pricing & Resolution (Admin) ────────────────────
export const updateQuoteStatusDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      status: z
        .enum([
          "Under Review",
          "Engineering Review",
          "Pricing Ready",
          "Approved",
          "Accepted",
          "Rejected",
          "Resolved",
          "Converted to Order",
          "Cancelled",
        ])
        .optional(),
      isResolved: z.boolean().optional(),
      quotedAmount: z.number().optional(),
      adminLeadTime: z.string().optional(),
      adminFreightTerms: z.string().optional(),
      adminNotes: z.string().optional(),
      adminProposalNotes: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const quotesCol = db.collection("quotes");

      const updateFields: any = {
        updatedAt: new Date().toISOString(),
      };

      if (data.status !== undefined) {
        updateFields.status = data.status;
        if (data.status === "Resolved" || data.status === "Accepted" || data.status === "Converted to Order") {
          updateFields.isResolved = true;
          updateFields.resolvedAt = new Date().toISOString();
        }
      }

      if (data.isResolved !== undefined) {
        updateFields.isResolved = data.isResolved;
        if (data.isResolved) {
          updateFields.resolvedAt = updateFields.resolvedAt || new Date().toISOString();
          if (!data.status) {
            updateFields.status = "Resolved";
          }
        } else {
          updateFields.resolvedAt = null;
          if (!data.status && updateFields.status === "Resolved") {
            updateFields.status = "Engineering Review";
          }
        }
      }

      if (data.quotedAmount !== undefined) {
        updateFields.quotedAmount = data.quotedAmount;
        updateFields.totalAmount = data.quotedAmount;
      }

      if (data.adminLeadTime !== undefined) {
        updateFields.adminLeadTime = data.adminLeadTime;
      }

      if (data.adminFreightTerms !== undefined) {
        updateFields.adminFreightTerms = data.adminFreightTerms;
      }

      if (data.adminNotes !== undefined) {
        updateFields.adminNotes = data.adminNotes;
      }

      if (data.adminProposalNotes !== undefined) {
        updateFields.adminProposalNotes = data.adminProposalNotes;
      }

      const query: any = {
        $or: [{ _id: toObjectId(data.id) }, { quoteId: data.id }, { id: data.id }],
      };

      const res = await (quotesCol as any).updateOne(query, { $set: updateFields });

      if (res.matchedCount === 0) {
        return { success: false, error: "Quote record not found." };
      }

      return { success: true };
    } catch (e: any) {
      console.error("Update Quote Status Error:", e);
      return { success: false, error: "Failed to update quote record." };
    }
  });

// ── 4. Toggle Quote Resolved / Unresolved (Admin Quick Action) ──────────────
export const toggleQuoteResolvedDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      resolved: z.boolean(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const quotesCol = db.collection("quotes");

      const now = new Date().toISOString();
      const updateFields: any = {
        isResolved: data.resolved,
        updatedAt: now,
      };

      if (data.resolved) {
        updateFields.resolvedAt = now;
        updateFields.status = "Resolved";
      } else {
        updateFields.resolvedAt = null;
        updateFields.status = "Engineering Review";
      }

      const query: any = {
        $or: [{ _id: toObjectId(data.id) }, { quoteId: data.id }, { id: data.id }],
      };

      await (quotesCol as any).updateOne(query, { $set: updateFields });
      return { success: true, isResolved: data.resolved };
    } catch (e: any) {
      console.error("Toggle Quote Resolved Error:", e);
      return { success: false, error: "Failed to toggle quote resolution." };
    }
  });

// ── 5. Delete Quote Request (Admin) ─────────────────────────────────────────
export const deleteQuoteDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const quotesCol = db.collection("quotes");

      const query: any = {
        $or: [{ _id: toObjectId(data.id) }, { quoteId: data.id }, { id: data.id }],
      };

      const result = await (quotesCol as any).deleteOne(query);
      if (result.deletedCount === 0) {
        return { success: false, error: "Quote record not found." };
      }

      return { success: true };
    } catch (e: any) {
      console.error("Delete Quote Error:", e);
      return { success: false, error: "Failed to delete quote record." };
    }
  });
