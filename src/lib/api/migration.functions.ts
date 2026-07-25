import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

export const getDatabaseStats = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) {
        return {
          success: true,
          stats: { products: 0, orders: 0, reviews: 0 }
        };
      }
      
      const productsCol = db.collection("products");
      const ordersCol = db.collection("orders");
      const reviewsCol = db.collection("reviews");

      const productsCount = await productsCol.countDocuments();
      const ordersCount = await ordersCol.countDocuments();
      const reviewsCount = await reviewsCol.countDocuments();

      return {
        success: true,
        stats: {
          products: productsCount,
          orders: ordersCount,
          reviews: reviewsCount
        }
      };
    } catch (e: any) {
      console.error("Failed to get DB stats:", e);
      return { success: false, error: "Failed to query database statistics." };
    }
  });

export const migrateData = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    products: z.array(z.any()),
    orders: z.array(z.any()),
    reviews: z.array(z.any())
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const { products, orders, reviews } = data;

      // 1. Sync Products
      if (products.length > 0) {
        const productsCol = db.collection("products");
        for (const item of products) {
          const doc = { ...item, _id: item.id };
          await productsCol.replaceOne({ _id: item.id }, doc, { upsert: true });
        }
      }

      // 2. Sync Orders
      if (orders.length > 0) {
        const ordersCol = db.collection("orders");
        for (const order of orders) {
          const doc = { ...order, _id: order.id };
          await ordersCol.replaceOne({ _id: order.id }, doc, { upsert: true });
        }
      }

      // 3. Sync Reviews (Global reviews collection)
      if (reviews.length > 0) {
        const reviewsCol = db.collection("reviews");
        for (const rev of reviews) {
          const doc = { ...rev, _id: rev.id };
          await reviewsCol.replaceOne({ _id: rev.id }, doc, { upsert: true });
        }
      }

      // Retrieve new counts
      const productsCol = db.collection("products");
      const ordersCol = db.collection("orders");
      const reviewsCol = db.collection("reviews");

      const productsCount = await productsCol.countDocuments();
      const ordersCount = await ordersCol.countDocuments();
      const reviewsCount = await reviewsCol.countDocuments();

      return {
        success: true,
        stats: {
          products: productsCount,
          orders: ordersCount,
          reviews: reviewsCount
        }
      };
    } catch (e: any) {
      console.error("Database migration error:", e);
      return { success: false, error: `Migration error: ${e.message || String(e)}` };
    }
  });
