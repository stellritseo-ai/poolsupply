import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";

export const getDatabaseStats = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const db = await connectDB();
      const productsCount = await db.collection("products").countDocuments();
      const ordersCount = await db.collection("orders").countDocuments();
      const reviewsCount = await db.collection("reviews").countDocuments();

      return {
        success: true,
        stats: {
          products: productsCount,
          orders: ordersCount,
          reviews: reviewsCount
        }
      };
    } catch (e: any) {
      console.error("Failed to fetch database stats:", e);
      return {
        success: false,
        error: e.message || "Failed to connect to database"
      };
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

      let productsUpserted = 0;
      let ordersUpserted = 0;
      let reviewsUpserted = 0;

      // Bulk write products
      if (data.products.length > 0) {
        const ops = data.products.map(p => ({
          updateOne: {
            filter: { id: p.id },
            update: { $set: p },
            upsert: true
          }
        }));
        const res = await db.collection("products").bulkWrite(ops);
        productsUpserted = res.upsertedCount + res.modifiedCount;
      }

      // Bulk write orders
      if (data.orders.length > 0) {
        const ops = data.orders.map(o => ({
          updateOne: {
            filter: { id: o.id },
            update: { $set: o },
            upsert: true
          }
        }));
        const res = await db.collection("orders").bulkWrite(ops);
        ordersUpserted = res.upsertedCount + res.modifiedCount;
      }

      // Bulk write reviews
      if (data.reviews.length > 0) {
        const ops = data.reviews.map(r => ({
          updateOne: {
            filter: { id: r.id },
            update: { $set: r },
            upsert: true
          }
        }));
        const res = await db.collection("reviews").bulkWrite(ops);
        reviewsUpserted = res.upsertedCount + res.modifiedCount;
      }

      return {
        success: true,
        stats: {
          products: productsUpserted,
          orders: ordersUpserted,
          reviews: reviewsUpserted
        }
      };
    } catch (e: any) {
      console.error("Failed to migrate data:", e);
      return {
        success: false,
        error: e.message || "Failed to run migration"
      };
    }
  });
