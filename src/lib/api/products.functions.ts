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

// Helper function to verify and seed products if database collection is empty
async function getOrSeedProducts(productsCol: any): Promise<any[]> {
  const count = await productsCol.countDocuments();
  if (count === 0) {
    console.log("Seeding MongoDB products collection with default catalog...");
    const docs = defaultProducts.map((p) => {
      const doc = { ...p, _id: p.id };
      // delete doc.id; // Keep _id as the primary key reference
      return doc;
    });
    await productsCol.insertMany(docs);
  }
  return await productsCol.find().toArray();
}

export const getProductsDb = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const db = await connectDB();
      const productsCol = db.collection("products");

      const rawProducts = await getOrSeedProducts(productsCol);

      const formatted = rawProducts.map((p: any) => {
        const item = { ...p, id: p._id.toString() };
        delete item._id;
        return item as Product;
      });

      return { success: true, products: formatted };
    } catch (e: any) {
      console.error("Failed to fetch products from DB:", e);
      return { success: false, error: "Failed to load products from database." };
    }
  });

export const searchProductsDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ query: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const productsCol = db.collection("products");

      // Ensure seed has run at least once
      await getOrSeedProducts(productsCol);

      const queryStr = data.query.trim();
      if (!queryStr) {
        return { success: true, products: [] };
      }

      const regex = new RegExp(queryStr, "i");
      const matched = await productsCol.find({
        $or: [
          { name: { $regex: regex } },
          { brand: { $regex: regex } },
          { category: { $regex: regex } },
          { sku: { $regex: regex } },
          { description: { $regex: regex } }
        ]
      }).limit(8).toArray();

      const formatted = matched.map((p: any) => {
        const item = { ...p, id: p._id.toString() };
        delete item._id;
        return item as Product;
      });

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

export const deleteProductDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const productsCol = db.collection("products");

      const queryId = toQueryId(data.id);
      await productsCol.deleteOne({ _id: queryId });
      return { success: true };
    } catch (e: any) {
      console.error("Failed to delete product from DB:", e);
      return { success: false, error: "Failed to delete product from database." };
    }
  });

export const addReviewDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ productId: z.string(), review: z.any() }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      const productsCol = db.collection("products");

      const queryId = toQueryId(data.productId);
      
      // 1. Embed in the product document for fast frontend loading
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

      // 2. Also insert into the dedicated 'reviews' collection for database visibility
      const reviewsCol = db.collection("reviews");
      const standaloneReview = {
        ...data.review,
        productId: data.productId, // Link it to the product
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
      const productsCol = db.collection("products");

      const queryId = toQueryId(data.productId);
      
      // 1. Remove from embedded product document
      await productsCol.updateOne(
        { _id: queryId },
        {
          $pull: {
            reviews: { id: data.reviewId }
          } as any
        }
      );

      // 2. Remove from the dedicated 'reviews' collection
      const reviewsCol = db.collection("reviews");
      await reviewsCol.deleteOne({ id: data.reviewId });
      return { success: true };
    } catch (e: any) {
      console.error("Failed to delete review from DB:", e);
      return { success: false, error: "Failed to delete review from database." };
    }
  });
