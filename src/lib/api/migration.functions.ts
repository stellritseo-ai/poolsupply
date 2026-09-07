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
          stats: {
            products: 0,
            orders: 0,
            customers: 0,
            reviews: 0,
            users: 0,
            categories: 0,
            cart_items: 0,
            inquiries: 0,
            admin_security_locks: 0,
            settings: 0,
          }
        };
      }

      const [
        productsCount,
        ordersCount,
        customersCount,
        reviewsCount,
        usersCount,
        categoriesCount,
        cartItemsCount,
        inquiriesCount,
        locksCount,
        settingsCount,
      ] = await Promise.all([
        db.collection("products").countDocuments().catch(() => 0),
        db.collection("orders").countDocuments().catch(() => 0),
        db.collection("customers").countDocuments().catch(() => 0),
        db.collection("reviews").countDocuments().catch(() => 0),
        db.collection("users").countDocuments().catch(() => 0),
        db.collection("categories").countDocuments().catch(() => 0),
        db.collection("cart_items").countDocuments().catch(() => 0),
        db.collection("inquiries").countDocuments().catch(() => 0),
        db.collection("admin_security_locks").countDocuments().catch(() => 0),
        db.collection("settings").countDocuments().catch(() => 0),
      ]);

      return {
        success: true,
        stats: {
          products: productsCount,
          orders: ordersCount,
          customers: customersCount,
          reviews: reviewsCount,
          users: usersCount,
          categories: categoriesCount,
          cart_items: cartItemsCount,
          inquiries: inquiriesCount,
          admin_security_locks: locksCount,
          settings: settingsCount,
        }
      };
    } catch (e: any) {
      console.error("Failed to get DB stats:", e);
      return { success: false, error: "Failed to query database statistics." };
    }
  });

export const exportCollectionSnapshot = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    collectionName: z.enum([
      "products",
      "orders",
      "customers",
      "reviews",
      "categories",
      "inquiries",
      "settings",
    ]),
  }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable." };
      const col = db.collection(data.collectionName);

      const docs = await col.find({}).limit(1000).toArray();

      // Cleanse sensitive data and ensure JSON serializable _id
      const cleaned = docs.map(doc => {
        const copy: any = { ...doc };
        if (copy._id) copy._id = copy._id.toString();
        delete copy.password;
        return copy;
      });

      return {
        success: true,
        collectionName: data.collectionName,
        count: cleaned.length,
        exportedAt: new Date().toISOString(),
        data: cleaned,
      };
    } catch (e: any) {
      console.error(`Export ${data.collectionName} error:`, e);
      return { success: false, error: `Failed to export ${data.collectionName}` };
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

      // 1. Sync Products (Defensive deduplicated matching by SKU or ID)
      if (products.length > 0) {
        const productsCol = db.collection("products");
        for (const item of products) {
          const existing = await productsCol.findOne({
            $or: [
              { sku: item.sku },
              { id: item.id },
              { _id: item.id as any },
            ]
          });
          if (existing) {
            await productsCol.replaceOne(
              { _id: existing._id },
              { ...item, _id: existing._id }
            );
          } else {
            await productsCol.insertOne({ ...item, _id: item.id });
          }
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

      const statsRes = await getDatabaseStats();
      return {
        success: true,
        stats: statsRes.stats,
      };
    } catch (e: any) {
      console.error("Database migration error:", e);
      return { success: false, error: `Migration error: ${e.message || String(e)}` };
    }
  });
