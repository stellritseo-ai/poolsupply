import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import { ObjectId } from "mongodb";

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
  address: AddressSchema,
  items: z.array(OrderItemSchema),
  subtotal: z.number(),
  shipping: z.number(),
  tax: z.number(),
  total: z.number(),
  status: z.enum(["Pending", "Shipped", "Delivered", "Cancelled"]).optional(),
  method: z.string()
});

export type Order = z.infer<typeof OrderSchema>;

export const getOrdersDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      const ordersCol = db.collection("orders");
      
      const orders = await ordersCol.find().toArray();
      
      const formatted = orders.map((o: any) => {
        const item = { ...o };
        if (!item.id) {
          item.id = o._id.toString();
        }
        delete item._id;
        return item as Order;
      });
      
      return { success: true, orders: formatted };
    } catch (e: any) {
      console.error("Failed to fetch orders from DB:", e);
      return { success: false, error: "Failed to load orders from database." };
    }
  });

export const updateOrderStatusDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), status: z.enum(["Pending", "Shipped", "Delivered", "Cancelled"]) }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
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
