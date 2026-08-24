import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import { ObjectId } from "mongodb";

function toObjectId(id: string): any {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}

export type ReturnItem = {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  qty?: number;
  img?: string;
};

export type ReturnRequest = {
  id: string;
  rmaId: string;
  customerIdentifier: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  orderId: string;
  orderTotal?: number;
  orderPlacedAt?: string;
  reason: string;
  notes?: string;
  items: ReturnItem[];
  preferredResolution?: string;
  status:
    | "Under Review"
    | "Approved"
    | "Rejected"
    | "Processing Return"
    | "Item Received"
    | "Replacement Shipped"
    | "Refund Issued"
    | "Resolved"
    | "Cancelled";
  isResolved: boolean;
  adminNotes?: string;
  adminResolution?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
};

// ── 1. Create Return Request (Customer & System) ──────────────────────────────
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

      // Attempt to enrich with existing order details if not supplied
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

      const result = await returnsCol.insertOne(doc);

      // Create Admin Notification
      try {
        await notifsCol.insertOne({
          title: `New Return / RMA Request: ${rmaId}`,
          message: `Return request submitted by ${doc.customerName} for Order #${data.orderId} (${data.reason}).`,
          type: "return",
          read: false,
          createdAt: new Date(),
        });
      } catch (err) {
        console.warn("Could not insert notification for RMA:", err);
      }

      return {
        success: true,
        rmaId,
        id: result.insertedId.toString(),
      };
    } catch (e: any) {
      console.error("Create Return Request Error:", e);
      return { success: false, error: "Failed to submit return request." };
    }
  });

// ── 2. Get All Return Requests (Admin) ────────────────────────────────────────
export const getAdminReturnsDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) return { success: true as const, returns: [] as ReturnRequest[] };
      const returnsCol = db.collection("returns");

      const rawReturns = await returnsCol.find().sort({ createdAt: -1 }).toArray();

      const returns: ReturnRequest[] = rawReturns.map((r: any) => ({
        id: r._id.toString(),
        rmaId: r.rmaId || `RMA-${r._id.toString().slice(-6)}`,
        customerIdentifier: r.customerIdentifier || "",
        customerName: r.customerName || "Trade Client",
        customerEmail: r.customerEmail || "",
        customerPhone: r.customerPhone || "",
        customerCompany: r.customerCompany || "",
        orderId: r.orderId || "",
        orderTotal: typeof r.orderTotal === "number" ? r.orderTotal : 0,
        orderPlacedAt: r.orderPlacedAt || r.createdAt,
        reason: r.reason || "General Return",
        notes: r.notes || "",
        items: Array.isArray(r.items) ? r.items : [],
        preferredResolution: r.preferredResolution || "Replacement Unit",
        status: r.status || "Under Review",
        isResolved: typeof r.isResolved === "boolean" ? r.isResolved : r.status === "Resolved",
        adminNotes: r.adminNotes || "",
        adminResolution: r.adminResolution || "",
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || r.createdAt,
        resolvedAt: r.resolvedAt,
      }));

      return { success: true, returns };
    } catch (e: any) {
      console.error("Get Admin Returns Error:", e);
      return { success: false, error: "Failed to fetch returns data.", returns: [] as ReturnRequest[] };
    }
  });

// ── 3. Update Return Status & Resolution (Admin) ──────────────────────────────
export const updateReturnStatusDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      status: z
        .enum([
          "Under Review",
          "Approved",
          "Rejected",
          "Processing Return",
          "Item Received",
          "Replacement Shipped",
          "Refund Issued",
          "Resolved",
          "Cancelled",
        ])
        .optional(),
      isResolved: z.boolean().optional(),
      adminNotes: z.string().optional(),
      adminResolution: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false as const, error: "Database unavailable." };
      const returnsCol = db.collection("returns");

      const updateFields: any = {
        updatedAt: new Date().toISOString(),
      };

      if (data.status !== undefined) {
        updateFields.status = data.status;
        if (data.status === "Resolved") {
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
            updateFields.status = "Under Review";
          }
        }
      }

      if (data.adminNotes !== undefined) {
        updateFields.adminNotes = data.adminNotes;
      }

      if (data.adminResolution !== undefined) {
        updateFields.adminResolution = data.adminResolution;
      }

      const query = {
        $or: [{ _id: toObjectId(data.id) }, { rmaId: data.id }, { id: data.id }],
      };

      const res = await returnsCol.updateOne(query, { $set: updateFields });

      if (res.matchedCount === 0) {
        return { success: false as const, error: "Return record not found." };
      }

      return { success: true };
    } catch (e: any) {
      console.error("Update Return Status Error:", e);
      return { success: false, error: "Failed to update return record." };
    }
  });

// ── 4. Toggle Return Resolved / Unresolved (Admin Quick Action) ───────────────
export const toggleReturnResolvedDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      resolved: z.boolean(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false as const, error: "Database unavailable." };
      const returnsCol = db.collection("returns");

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
        updateFields.status = "Under Review";
      }

      const query = {
        $or: [{ _id: toObjectId(data.id) }, { rmaId: data.id }, { id: data.id }],
      };

      await returnsCol.updateOne(query, { $set: updateFields });
      return { success: true, isResolved: data.resolved };
    } catch (e: any) {
      console.error("Toggle Return Resolved Error:", e);
      return { success: false, error: "Failed to toggle return resolution." };
    }
  });

// ── 5. Delete Return Request (Admin) ──────────────────────────────────────────
export const deleteReturnDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false as const, error: "Database unavailable." };
      const returnsCol = db.collection("returns");

      const query = {
        $or: [{ _id: toObjectId(data.id) }, { rmaId: data.id }, { id: data.id }],
      };

      const result = await returnsCol.deleteOne(query);
      if (result.deletedCount === 0) {
        return { success: false as const, error: "Return record not found." };
      }

      return { success: true };
    } catch (e: any) {
      console.error("Delete Return Error:", e);
      return { success: false, error: "Failed to delete return record." };
    }
  });
