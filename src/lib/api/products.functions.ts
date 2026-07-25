import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "../db";
import { Product } from "../products";
import { products as defaultProducts } from "../default-products";

import { ObjectId } from "mongodb";

function toQueryId(id: string): any {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
}


export const getProductsDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ limit: z.number().optional(), category: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: false, products: [] };
      }
      const productsCol = db.collection("products");

      const limit = data?.limit || 1200;
      let query: any = {};

      if (data?.category && data.category !== "all") {
        // Build multiple slug variants to match DB values like "Ladders & Rails" from slug "ladders-and-rails"
        const slug = data.category;
        const variants = [
          slug.replace(/-/g, " "),                          // "ladders and rails"
          slug.replace(/-and-/g, " & ").replace(/-/g, " "), // "ladders & rails"
          slug.replace(/-or-/g, " / ").replace(/-/g, " "),  // for slash variants
          slug,                                              // raw slug as-is
        ];
        // Escape regex special chars then join as alternation
        const escapedVariants = variants.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        const combinedPattern = escapedVariants.join("|");
        const catRegex = new RegExp(combinedPattern, "i");
        query = {
          $or: [
            { category: { $regex: catRegex } },
            { parentCategory: { $regex: catRegex } },
            { subCategory: { $regex: catRegex } }
          ]
        };
      }

      const rawProducts = await productsCol.find(query).limit(limit).toArray();

      const formatted = rawProducts.map((p: any) => {
        const item = { ...p, id: p._id.toString() };
        delete item._id;
        if (!item.img || typeof item.img !== "string" || !item.img.startsWith("http")) {
          item.img = "/assets/commingsoon.png";
        }
        return item as Product;
      });

      return { success: true, products: formatted };
    } catch (e: any) {
      console.error("Failed to fetch products from DB:", e);
      return { success: false, error: "Failed to load products from database." };
    }
  });

export const getAllProductsAdminDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: false, products: [] };
      }
      const productsCol = db.collection("products");

      const rawProducts = await productsCol.find().toArray();

      const formatted = rawProducts.map((p: any) => {
        const item = { ...p, id: p._id.toString() };
        delete item._id;
        if (!item.img || typeof item.img !== "string" || !item.img.startsWith("http")) {
          item.img = "/assets/commingsoon.png";
        }
        return item as Product;
      });

      return { success: true, products: formatted };
    } catch (e: any) {
      console.error("Failed to fetch all admin products from DB:", e);
      return { success: false, error: "Failed to load all admin products from database." };
    }
  });

export const searchProductsDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ query: z.string() }))
  .handler(async ({ data }) => {
    try {
      const queryStr = data.query.trim();
      if (!queryStr) {
        return { success: true, products: [] };
      }

      const terms = queryStr.split(/\s+/).filter(Boolean);
      const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

      let formatted: Product[] = [];

      try {
        const db = await connectDB();
        if (!db) return { success: true, products: [] };
        const productsCol = db.collection("products");

        const andConditions = escapedTerms.map(term => {
          const regex = new RegExp(term, "i");
          return {
            $or: [
              { name: { $regex: regex } },
              { brand: { $regex: regex } },
              { sku: { $regex: regex } },
              { category: { $regex: regex } },
              { parentCategory: { $regex: regex } },
              { subCategory: { $regex: regex } },
              { description: { $regex: regex } },
              { details: { $regex: regex } },
              { seoKeywords: { $regex: regex } },
              { "specs.Manufacturer / Brand": { $regex: regex } },
              { "specs.Official SKU": { $regex: regex } },
              { "specs.Official SKU / Part Number": { $regex: regex } },
              { "specs.Specific Features": { $regex: regex } },
              { "specs.Compatibility": { $regex: regex } },
              { "specs.Horsepower": { $regex: regex } },
              { "specs.Capacity": { $regex: regex } },
              { "specs.Capacity (BTU)": { $regex: regex } },
              { "specs.Voltage": { $regex: regex } },
              { "specs.Filter Area": { $regex: regex } },
            ]
          };
        });

        const matched = await productsCol.find({ $and: andConditions }).limit(24).toArray();

        formatted = matched.map((p: any) => {
          const item = { ...p, id: p._id.toString() };
          delete item._id;
          if (!item.img || typeof item.img !== "string" || !item.img.startsWith("http")) {
            item.img = "/assets/commingsoon.png";
          }
          return item as Product;
        });
      } catch (dbErr) {
        console.error("DB Search failed, attempting fallback:", dbErr);
      }

      // If DB returned 0 results (e.g. database empty or no matches in DB), search in default products catalog
      if (formatted.length === 0) {
        const defaultMatched = defaultProducts.filter(p => {
          const name = (p.name || "").toLowerCase();
          const brand = (p.brand || "").toLowerCase();
          const sku = (p.sku || "").toLowerCase();
          const category = (p.category || "").toLowerCase();
          const parentCategory = (p.parentCategory || "").toLowerCase();
          const description = (p.description || "").toLowerCase();
          const details = (p.details || "").toLowerCase();
          const seoKeywords = (p.seoKeywords || "").toLowerCase();
          const specsStr = p.specs ? Object.values(p.specs).filter(Boolean).join(" ").toLowerCase() : "";

          const fullText = `${name} ${brand} ${sku} ${category} ${parentCategory} ${description} ${details} ${seoKeywords} ${specsStr}`;

          return terms.every(term => fullText.includes(term.toLowerCase()));
        }).slice(0, 24);

        formatted = defaultMatched;
      }

      return { success: true, products: formatted };
    } catch (e: any) {
      console.error("Search failed in DB:", e);
      return { success: false, error: "Search failed." };
    }
  });

export const saveProductDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ product: z.any() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable" };
      const productsCol = db.collection("products");

      const product = data.product;
      const queryId = toQueryId(product.id);
      const doc = { ...product, _id: queryId };

      await productsCol.replaceOne({ _id: queryId }, doc, { upsert: true });
      return { success: true };
    } catch (e: any) {
      console.error("Failed to save product to DB:", e);
      return { success: false, error: "Failed to save product to database." };
    }
  });

export const bulkSaveProductsDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ products: z.array(z.any()) }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable" };
      const productsCol = db.collection("products");

      const operations = data.products.map((product) => {
        const queryId = toQueryId(product.id);
        const doc = { ...product, _id: queryId };
        return {
          replaceOne: {
            filter: { _id: queryId },
            replacement: doc,
            upsert: true
          }
        };
      });

      const res = await productsCol.bulkWrite(operations);
      return { success: true, count: (res.upsertedCount || 0) + (res.modifiedCount || 0) };
    } catch (e: any) {
      console.error("Failed to bulk save products to DB:", e);
      return { success: false, error: "Failed to bulk save products to database." };
    }
  });

export const deleteProductDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable" };
      const productsCol = db.collection("products");

      const queryId = toQueryId(data.id);
      await productsCol.deleteOne({ _id: queryId });
      return { success: true };
    } catch (e: any) {
      console.error("Failed to delete product from DB:", e);
      return { success: false, error: "Failed to delete product from database." };
    }
  });

export const bulkDeleteProductsDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ ids: z.array(z.string()) }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable" };
      const productsCol = db.collection("products");

      const queryIds = data.ids.map((id) => toQueryId(id));
      const res = await productsCol.deleteMany({ _id: { $in: queryIds } });
      return { success: true, count: res.deletedCount };
    } catch (e: any) {
      console.error("Failed to bulk delete products from DB:", e);
      return { success: false, error: "Failed to bulk delete products from database." };
    }
  });

export const deleteAllProductsDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable" };
      const productsCol = db.collection("products");
      const res = await productsCol.deleteMany({});
      return { success: true, count: res.deletedCount };
    } catch (e: any) {
      console.error("Failed to delete all products from DB:", e);
      return { success: false, error: "Failed to delete all products from database." };
    }
  });

export const addReviewDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ productId: z.string(), review: z.any() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable" };
      const productsCol = db.collection("products");

      const queryId = toQueryId(data.productId);

      await productsCol.updateOne(
        { _id: queryId },
        {
          $push: {
            reviews: {
              $each: [data.review],
              $position: 0
            }
          } as any
        }
      );

      const reviewsCol = db.collection("reviews");
      const standaloneReview = {
        ...data.review,
        productId: data.productId,
        _id: toQueryId(data.review.id)
      };
      await reviewsCol.insertOne(standaloneReview);
      return { success: true };
    } catch (e: any) {
      console.error("Failed to add review to DB:", e);
      return { success: false, error: "Failed to submit review to database." };
    }
  });

export const deleteReviewDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ productId: z.string(), reviewId: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable" };
      const productsCol = db.collection("products");

      const queryId = toQueryId(data.productId);

      await productsCol.updateOne(
        { _id: queryId },
        {
          $pull: {
            reviews: { id: data.reviewId }
          } as any
        }
      );

      const reviewsCol = db.collection("reviews");
      await reviewsCol.deleteOne({ id: data.reviewId });
      return { success: true };
    } catch (e: any) {
      console.error("Failed to delete review from DB:", e);
      return { success: false, error: "Failed to delete review from database." };
    }
  });
