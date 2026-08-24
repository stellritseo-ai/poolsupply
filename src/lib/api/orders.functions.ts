import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import { ObjectId } from "mongodb";
import { sendNewOrderAdminNotification } from "../mailer";

function toQueryId(id: string): any {
  try {
    return new ObjectId(id);
  } catch {
    return id; // fallback to string
  }
}

const OrderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  price: z.number(),
  qty: z.number(),
  img: z.string().optional()
});

const AddressSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string()
});

const OrderSchema = z.object({
  id: z.string(),
  placedAt: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  name: z.string(),
  company: z.string().optional(),
  address: AddressSchema,
  items: z.array(OrderItemSchema),
  subtotal: z.number(),
  shipping: z.number(),
  tax: z.number(),
  total: z.number(),
  discount: z.number().optional(),
  promoCode: z.string().nullable().optional(),
  paymentType: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentIntentId: z.string().optional(),
  status: z.enum(["Pending", "Shipped", "Delivered", "Cancelled"]).optional(),
  method: z.string()
});

export type Order = z.infer<typeof OrderSchema>;

export const getOrdersDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) return { success: true, orders: [] };
      const ordersCol = db.collection("orders");

      const orders = await ordersCol
        .find()
        .sort({ placedAt: -1, _id: -1 })
        .toArray();

      const formatted = orders.map((o: any) => {
        const item = { ...o };
        if (!item.id) {
          item.id = o._id.toString();
        }
        delete item._id;
        return item as Order;
      });

      // Defensive JS sort to guarantee newest timestamp is always index 0
      formatted.sort((a, b) => {
        const timeA = new Date(a.placedAt || 0).getTime();
        const timeB = new Date(b.placedAt || 0).getTime();
        return timeB - timeA;
      });

      return { success: true, orders: formatted };
    } catch (e: any) {
      console.error("Failed to fetch orders from DB:", e);
      return { success: false, error: "Failed to load orders from database." };
    }
  });

export const getOrderByIdDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const ordersCol = db.collection("orders");
      const cleanId = data.id.trim();

      const order = await ordersCol.findOne({
        $or: [
          { id: cleanId },
          { _id: toQueryId(cleanId) },
          { id: { $regex: new RegExp(`^${cleanId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } }
        ]
      });

      if (!order) return { success: false, error: "Order not found." };

      const item: any = { ...order };
      if (!item.id) {
        item.id = order._id.toString();
      }
      delete item._id;

      return { success: true, order: item as Order };
    } catch (e: any) {
      console.error("Failed to fetch order by ID:", e);
      return { success: false, error: "Failed to fetch order." };
    }
  });

export const updateOrderStatusDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), status: z.enum(["Pending", "Shipped", "Delivered", "Cancelled"]) }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const ordersCol = db.collection("orders");

      const result = await ordersCol.updateOne(
        { $or: [{ _id: toQueryId(data.id) }, { id: data.id }] },
        { $set: { status: data.status } }
      );

      return { success: true };
    } catch (e: any) {
      console.error("Failed to update order status in DB:", e);
      return { success: false, error: "Failed to update order status." };
    }
  });

export const deleteOrderDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const ordersCol = db.collection("orders");

      await ordersCol.deleteOne({ $or: [{ _id: toQueryId(data.id) }, { id: data.id }] });

      return { success: true };
    } catch (e: any) {
      console.error("Failed to delete order from DB:", e);
      return { success: false, error: "Failed to delete order." };
    }
  });

export const createOrderDb = createServerFn({ method: "POST" })
  .inputValidator(OrderSchema)
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const ordersCol = db.collection("orders");

      const toInsert = { ...data };
      if (!toInsert.status) toInsert.status = "Pending";

      await ordersCol.insertOne(toInsert);

      const notifsCol = db.collection("notifications");
      await notifsCol.insertOne({
        title: "New Order Received",
        message: `Order #${data.id} has been placed by ${data.name}.`,
        type: "order",
        read: false,
        createdAt: new Date()
      });

      // Dispatch real-time Gmail notification to admin
      sendNewOrderAdminNotification(data as any).catch((err) => {
        console.error("Non-blocking error dispatching order notification email:", err);
      });

      return { success: true, orderId: data.id };
    } catch (e: any) {
      console.error("Failed to create order in DB:", e);
      return { success: false, error: "Failed to create order." };
    }
  });

export const seedMockOrdersDb = createServerFn({ method: "POST" })
  .inputValidator(z.array(OrderSchema))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const ordersCol = db.collection("orders");

      const count = await ordersCol.countDocuments();
      if (count === 0) {
        const toInsert = data.map(o => ({ ...o, _id: toQueryId(o.id) }));
        await ordersCol.insertMany(toInsert);
      }

      return { success: true };
    } catch (e: any) {
      console.error("Failed to seed orders to DB:", e);
      return { success: false, error: "Failed to seed orders." };
    }
  });
