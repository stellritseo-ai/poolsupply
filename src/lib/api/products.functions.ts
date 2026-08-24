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

      const limit = data?.limit || 200;
      let query: any = {};

      if (data?.category && data.category !== "all") {
        // Build multiple slug variants to match DB values like "Ladders & Rails", "Pumps", "Pool & Spa", etc.
        const slug = data.category.toLowerCase();
        const baseName = slug.replace(/^pool-/, "").replace(/-systems?$/, "").trim();
        const variants = [
          slug.replace(/-/g, " "),                          // "pool pumps", "parts hardware"
          slug.replace(/-and-/g, " & ").replace(/-/g, " "), // "ladders & rails"
          slug.replace(/-/g, " & "),                        // "parts & hardware", "pool & spa"
          slug.replace(/-or-/g, " / ").replace(/-/g, " "),  // for slash variants
          slug,                                              // "pool-pumps"
          baseName,                                          // "pumps", "heaters", "automation"
          baseName.replace(/-/g, " "),
        ];
        // Escape regex special chars then join as alternation
        const escapedVariants = Array.from(new Set(variants.filter(Boolean))).map(v => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
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

// ── Get Category Brands for Filter Sidebar ───────────────────────────────
export const getShopCategoryBrandsDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    category: z.string().optional(),
  }).optional())
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, brands: [] };

      const productsCol = db.collection("products");
      let query: any = {};

      if (data?.category && data.category.toLowerCase() !== "all") {
        const slug = data.category.toLowerCase();
        const baseName = slug.replace(/^pool-/, "").replace(/-systems?$/, "").trim();
        const variants = Array.from(new Set([
          slug.replace(/-/g, " "),
          slug.replace(/-and-/g, " & ").replace(/-/g, " "),
          slug.replace(/-/g, " & "),
          slug,
          baseName,
          baseName.replace(/-/g, " "),
        ].filter(Boolean)));
        const escaped = variants.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        const catRegex = new RegExp(escaped.join("|"), "i");
        query = {
          $or: [
            { category: { $regex: catRegex } },
            { parentCategory: { $regex: catRegex } },
            { subCategory: { $regex: catRegex } },
          ]
        };
      }

      const distinctBrands = await productsCol.distinct("brand", query);
      const cleanBrands = distinctBrands
        .filter((b): b is string => typeof b === "string" && b.trim().length > 0 && b.toLowerCase() !== "generic")
        .map(b => b.trim())
        .sort((a, b) => a.localeCompare(b));

      return { success: true, brands: cleanBrands };
    } catch (e: any) {
      console.error("Failed to fetch category brands:", e);
      return { success: false, brands: [] };
    }
  });

// ── Server-Side Paginated Shop Query (replaces client-side limit hack) ────
export const getShopProductsPagedDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
    category: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(["rating-desc", "price-asc", "price-desc", "name-asc"]).optional(),
    brand: z.string().optional(),
    brands: z.array(z.string()).optional(),
    inStockOnly: z.boolean().optional(),
  }).optional())
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, products: [], total: 0 };

      const productsCol = db.collection("products");
      const page = Math.max(1, data?.page || 1);
      const limit = Math.min(data?.limit || 35, 100);
      const skip = (page - 1) * limit;

      // ── Build query ──────────────────────────────────────────────────────
      const conditions: any[] = [];

      // Category filter
      if (data?.category && data.category.toLowerCase() !== "all") {
        const slug = data.category.toLowerCase();
        const baseName = slug.replace(/^pool-/, "").replace(/-systems?$/, "").trim();
        const variants = Array.from(new Set([
          slug.replace(/-/g, " "),
          slug.replace(/-and-/g, " & ").replace(/-/g, " "),
          slug.replace(/-/g, " & "),
          slug,
          baseName,
          baseName.replace(/-/g, " "),
        ].filter(Boolean)));
        const escaped = variants.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        const catRegex = new RegExp(escaped.join("|"), "i");
        conditions.push({
          $or: [
            { category: { $regex: catRegex } },
            { parentCategory: { $regex: catRegex } },
            { subCategory: { $regex: catRegex } },
          ]
        });
      }

      // Full-text search
      if (data?.search && data.search.trim()) {
        const terms = data.search.trim().split(/\s+/).filter(Boolean);
        for (const term of terms) {
          const tReg = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
          conditions.push({
            $or: [
              { name: { $regex: tReg } },
              { sku: { $regex: tReg } },
              { brand: { $regex: tReg } },
              { category: { $regex: tReg } },
              { description: { $regex: tReg } },
              { details: { $regex: tReg } },
              { seoKeywords: { $regex: tReg } },
            ]
          });
        }
      }

      // Brand filter (supports array of brands or single brand)
      if (data?.brands && data.brands.length > 0) {
        const brandRegexes = data.brands.map(b => new RegExp(`^${b.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"));
        conditions.push({ brand: { $in: brandRegexes } });
      } else if (data?.brand && data.brand.trim()) {
        const bReg = new RegExp(`^${data.brand.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
        conditions.push({ brand: { $regex: bReg } });
      }

      // In-stock filter
      if (data?.inStockOnly) {
        conditions.push({ stock: { $gt: 0 } });
      }

      const query = conditions.length > 0 ? { $and: conditions } : {};

      // ── Sort ─────────────────────────────────────────────────────────────
      let sortObj: any = { rating: -1 };
      if (data?.sort === "price-asc") sortObj = { price: 1 };
      else if (data?.sort === "price-desc") sortObj = { price: -1 };
      else if (data?.sort === "name-asc") sortObj = { name: 1 };

      // ── Projection: only fields needed by ProductCard ─────────────────
      const projection = {
        name: 1, sku: 1, brand: 1, price: 1, msrp: 1, rating: 1,
        img: 1, category: 1, parentCategory: 1, subCategory: 1,
        stock: 1, id: 1, seoKeywords: 1,
      };

      const [rawProducts, total] = await Promise.all([
        productsCol.find(query, { projection }).sort(sortObj).skip(skip).limit(limit).toArray(),
        productsCol.countDocuments(query),
      ]);

      const formatted = rawProducts.map((p: any) => {
        const item = { ...p, id: p.id || p._id.toString() };
        delete item._id;
        if (!item.img || typeof item.img !== "string" || !item.img.startsWith("http")) {
          item.img = "/assets/commingsoon.png";
        }
        return item as Product;
      });

      return {
        success: true,
        products: formatted,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (e: any) {
      console.error("Failed to fetch paged shop products:", e);
      return { success: false, products: [], total: 0, error: "Failed to load products." };
    }
  });

export const getAllProductsAdminDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ page: z.number().optional(), limit: z.number().optional(), search: z.string().optional(), category: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) {
        return { success: false, products: [], total: 0 };
      }
      const productsCol = db.collection("products");

      const page = data?.page || 1;
      const limit = Math.min(data?.limit || 100, 200); // max 200 per page
      const skip = (page - 1) * limit;

      // Build query filter
      let query: any = {};
      if (data?.search && data.search.trim()) {
        const regex = new RegExp(data.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        query = {
          $or: [
            { name: { $regex: regex } },
            { sku: { $regex: regex } },
            { brand: { $regex: regex } },
            { category: { $regex: regex } },
          ]
        };
      }
      if (data?.category && data.category !== "all") {
        const catRegex = new RegExp(data.category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        query = {
          ...query,
          $or: [
            { category: { $regex: catRegex } },
            { parentCategory: { $regex: catRegex } },
            { subCategory: { $regex: catRegex } },
          ]
        };
      }

      const [rawProducts, total] = await Promise.all([
        productsCol
          .find(query, { projection: { name: 1, sku: 1, brand: 1, price: 1, msrp: 1, stock: 1, img: 1, image: 1, category: 1, parentCategory: 1, subCategory: 1, id: 1 } })
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        productsCol.countDocuments(query),
      ]);

      const formatted = rawProducts.map((p: any) => {
        const item = { ...p, id: p.id || p._id.toString() };
        delete item._id;
        if (!item.img || typeof item.img !== "string" || !item.img.startsWith("http")) {
          item.img = "/assets/commingsoon.png";
        }
        return item as Product;
      });

      return { success: true, products: formatted, total, page, limit, pages: Math.ceil(total / limit) };
    } catch (e: any) {
      console.error("Failed to fetch all admin products from DB:", e);
      return { success: false, error: "Failed to load all admin products from database.", products: [], total: 0 };
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
      if (!db) return { success: false, error: "Database unavailable. Please check MongoDB connection." };
      const productsCol = db.collection("products");

      const product = { ...data.product };
      if (!product.id) {
        product.id = `p-${(product.sku || "prod").toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
      }
      product.price = Number(product.price) || 0;
      product.msrp = Number(product.msrp || product.price) || product.price;
      product.stock = Number(product.stock) || 0;
      product.rating = Number(product.rating) || 5.0;

      const queryId = toQueryId(product.id);
      const doc = { ...product, _id: queryId };

      // Look up existing product by queryId or id or sku
      const existing = await productsCol.findOne({
        $or: [{ _id: queryId }, { id: product.id }, { _id: product.id as any }]
      });

      if (existing) {
        await productsCol.replaceOne(
          { _id: existing._id },
          { ...product, _id: existing._id }
        );
      } else {
        await productsCol.insertOne(doc);
      }

      return { success: true, id: product.id };
    } catch (e: any) {
      console.error("Failed to save product to DB:", e);
      return { success: false, error: e.message || "Failed to save product to database." };
    }
  });

export const bulkSaveProductsDb = createServerFn({ method: "POST" })
  .inputValidator(z.object({ products: z.array(z.any()) }))
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable" };
      const productsCol = db.collection("products");

      const operations = data.products.map((p) => {
        const product = { ...p };
        if (!product.id) {
          product.id = `p-${(product.sku || "prod").toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
        }
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
      await productsCol.deleteOne({
        $or: [{ _id: queryId }, { id: data.id }, { _id: data.id as any }]
      });
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

export type AdminReview = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productBrand?: string;
  productImg?: string;
  author: string;
  authorEmail?: string;
  role?: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  status: "Published" | "Pending" | "Flagged";
  verifiedPurchase: boolean;
};

export const getAdminReviewsDb = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: boolean; reviews: AdminReview[] }> => {
    // Seed Contractor Reviews defined up front
    const seedContractorReviews: AdminReview[] = [
      {
        id: "gr-seed-1",
        productId: "p-pentair-intelliflo3",
        productName: "Pentair IntelliFlo3 VSF 3.0HP Variable Speed Pump with Touchscreen",
        productSku: "011075",
        productBrand: "Pentair",
        productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/011075_main.default.jpeg",
        author: "Robert Patterson",
        authorEmail: "robert@bluewavepools.com",
        role: "Commercial Pool Builder",
        rating: 5,
        date: "2026-05-28",
        title: "Saves us thousands on every commercial build",
        content: "The wholesale pricing here is unparalleled. We order all of our Pentair IntelliFlo3 pumps and Hayward commercial heaters through this portal. Delivery is consistently on time, which is critical for construction milestones.",
        status: "Published",
        verifiedPurchase: true,
      },
      {
        id: "gr-seed-2",
        productId: "p-hayward-tristar",
        productName: "Hayward TriStar VS 950 2.7HP Variable Speed Commercial Pump",
        productSku: "SP32950VSP",
        productBrand: "Hayward",
        productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/SP32950VSP_main.default.jpeg",
        author: "Elena Martinez",
        authorEmail: "elena@aqualuxpools.com",
        role: "Pool Service Contractor",
        rating: 5,
        date: "2026-05-15",
        title: "Best logistics operation in the pool business",
        content: "With three service trucks on the road, we need parts fast — zero exceptions. Having localized shipping out of their TN warehouse means standard delivery reaches us in 24 hours.",
        status: "Published",
        verifiedPurchase: true,
      },
      {
        id: "gr-seed-3",
        productId: "p-raypak-406a",
        productName: "Raypak 406A ASME Digital Gas Pool Heater 399k BTU",
        productSku: "014941",
        productBrand: "Raypak",
        productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/014941_main.default.jpeg",
        author: "Gary Lindqvist",
        authorEmail: "gary@summitresortfacilities.com",
        role: "Resort Facilities Manager",
        rating: 5,
        date: "2026-04-20",
        title: "Technical team caught a $12K sizing error",
        content: "Sizing a commercial pool filtration system is complex. The technical team here audited our pump head loss calculations before we submitted the PO and caught a sizing error that would have cost us $12,000 to fix post-install.",
        status: "Published",
        verifiedPurchase: true,
      },
      {
        id: "gr-seed-4",
        productId: "p-hayward-swimclear",
        productName: "Hayward SwimClear 425 Sq Ft Large Capacity Cartridge Filter",
        productSku: "C4030",
        productBrand: "Hayward",
        productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/C4030_main.default.jpeg",
        author: "Jessica Sterling",
        authorEmail: "jessica@clearwatercare.com",
        role: "Commercial Service Pro",
        rating: 5,
        date: "2026-04-10",
        title: "Genuine factory-sealed parts, full warranties",
        content: "I've dealt with liquidated suppliers before and had serial numbers rejected for factory warranties. Pool Supply Wholesalers is a direct authorized dealer for every brand they carry.",
        status: "Published",
        verifiedPurchase: true,
      },
      {
        id: "gr-seed-5",
        productId: "p-jandy-jxi",
        productName: "Jandy JXi 400k BTU Natural Gas Ultra-Compact Pool Heater",
        productSku: "JXI400N",
        productBrand: "Jandy",
        productImg: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/JXI400N_main.default.jpeg",
        author: "Marcus Vance",
        authorEmail: "marcus@desertsuncp.com",
        role: "Fleet Operations Lead",
        rating: 5,
        date: "2026-03-18",
        title: "Switched our entire contractor fleet to this supplier",
        content: "We run 8 service vehicles and used to split orders between three suppliers. Moving everything to Pool Supply Wholesalers simplified our operations massively. One account, one invoice, one shipping relationship.",
        status: "Published",
        verifiedPurchase: true,
      },
    ];

    try {
      const db = await connectDB();
      if (!db) return { success: true, reviews: seedContractorReviews };

      const productsCol = db.collection("products");
      const reviewsCol = db.collection("reviews");

      // 1. Fetch standalone reviews directly (fast, indexed)
      const rawStandalone = await reviewsCol.find().sort({ date: -1, _id: -1 }).toArray();

      // Collect product IDs to look up
      const prodIds = rawStandalone.map((r) => r.productId).filter(Boolean);
      const queryIds = prodIds.map((id) => toQueryId(id));

      let matchedProducts: any[] = [];
      if (prodIds.length > 0) {
        matchedProducts = await productsCol
          .find(
            { $or: [{ _id: { $in: queryIds } }, { id: { $in: prodIds } }] },
            { projection: { name: 1, sku: 1, brand: 1, img: 1, image: 1, id: 1 } }
          )
          .toArray();
      }

      const productMap = new Map<string, any>();
      matchedProducts.forEach((p: any) => {
        const id1 = p._id?.toString();
        const id2 = p.id;
        if (id1) productMap.set(id1, p);
        if (id2) productMap.set(id2, p);
      });

      const reviewMap = new Map<string, AdminReview>();

      // 2. Known Equipment Mappings for legacy reviews
      const knownEquipmentMap: Record<string, { name: string; sku: string; brand: string; img: string }> = {
        r2: {
          name: "Pentair IntelliFlo3 VSF 3.0HP Variable Speed Pump",
          sku: "011075",
          brand: "Pentair",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/011075_main.default.jpeg",
        },
        r3: {
          name: "Raypak 406A ASME Digital Gas Pool Heater 399k BTU",
          sku: "014941",
          brand: "Raypak",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/014941_main.default.jpeg",
        },
        r4: {
          name: "Raypak 266A Digital Natural Gas Pool Heater 266k BTU",
          sku: "014939",
          brand: "Raypak",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/014939_main.default.jpeg",
        },
        r5: {
          name: "Hayward ColorLogic 4.0 LED Pool Light 120V 100ft Cord",
          sku: "SP0527LED100",
          brand: "Hayward",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/SP0527LED100_main.default.jpeg",
        },
        r6: {
          name: "Hayward AquaVac 650 Robotic Pool Cleaner with Wi-Fi",
          sku: "RCH651CUY",
          brand: "Hayward",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/RCH651CUY_main.default.jpeg",
        },
        r7: {
          name: "Hayward Super Pump VS 1.65HP Variable Speed Pump",
          sku: "SP26115VSP",
          brand: "Hayward",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/SP26115VSP_main.default.jpeg",
        },
        r8: {
          name: "Hayward Universal H-Series 400k BTU Low NOx Gas Heater",
          sku: "H400FDN",
          brand: "Hayward",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/H400FDN_main.default.jpeg",
        },
        r9: {
          name: "Pentair IntelliBrite 5G Color LED Pool Light 120V 100ft",
          sku: "601002",
          brand: "Pentair",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/601002_main.default.jpeg",
        },
        r10: {
          name: "Pentair Clean & Clear Plus 420 Cartridge Filter 420 Sq Ft",
          sku: "160340",
          brand: "Pentair",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/160340_main.default.jpeg",
        },
        r11: {
          name: "Hayward SwimClear 525 Sq Ft Multi-Cartridge Pool Filter",
          sku: "C5030",
          brand: "Hayward",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/C5030_main.default.jpeg",
        },
        r12: {
          name: "Polaris 9650iQ Sport 4WD Robotic In-Ground Pool Cleaner",
          sku: "F9650IQ",
          brand: "Polaris",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/F9650IQ_main.default.jpeg",
        },
        r13: {
          name: "Pentair IntelliCenter Load Center with i8PS Personality Kit",
          sku: "521905",
          brand: "Pentair",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/521905_main.default.jpeg",
        },
        r14: {
          name: "Jandy AquaLink RS-PS8 Pool and Spa Combination System",
          sku: "RS-PS8",
          brand: "Jandy",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/RS-PS8_main.default.jpeg",
        },
        r15: {
          name: "Jandy Pro Series JE3000T Ultra-Efficient Pool Heat Pump",
          sku: "JE3000T",
          brand: "Jandy",
          img: "https://www.swimmingpooldistributors.com/site/Product Images/Upload_1/JE3000T_main.default.jpeg",
        },
      };

      // 3. Process standalone reviews
      rawStandalone.forEach((r: any, idx: number) => {
        const revId = String(r.id || (r._id ? r._id.toString() : `rev-${idx}`));
        const p = r.productId ? productMap.get(r.productId) : null;
        const known = knownEquipmentMap[revId];

        let validDate = String(r.date || "");
        if (!validDate || validDate.includes("Recently") || isNaN(new Date(validDate).getTime())) {
          validDate = new Date(Date.now() - idx * 86400000 * 2).toISOString().split("T")[0];
        }

        reviewMap.set(revId, {
          id: revId,
          productId: String(r.productId || p?.id || p?._id || known?.sku || `prod-${revId}`),
          productName: String(p?.name || known?.name || r.productName || r.targetName || "Commercial Pool Equipment"),
          productSku: String(p?.sku || known?.sku || r.productSku || r.sku || "PRO-SKU"),
          productBrand: String(p?.brand || known?.brand || r.productBrand || r.brand || "Commercial"),
          productImg: String(p?.img || p?.image || known?.img || r.productImg || r.img || "/assets/commingsoon.png"),
          author: String(r.author || "Verified Commercial Buyer"),
          authorEmail: String(r.email || r.authorEmail || ""),
          role: String(r.role || "Verified Contractor"),
          rating: typeof r.rating === "number" ? Number(r.rating) : 5,
          date: validDate,
          title: String(r.title || "Equipment Quality Review"),
          content: String(r.content || r.comment || ""),
          status: r.status === "Pending" || r.status === "Flagged" ? r.status : "Published",
          verifiedPurchase: typeof r.verifiedPurchase === "boolean" ? r.verifiedPurchase : true,
        });
      });

      // 4. Merge Seed Contractor Reviews

      seedContractorReviews.forEach((sr) => {
        if (!reviewMap.has(sr.id)) {
          reviewMap.set(sr.id, sr);
        }
      });

      const reviewsList = Array.from(reviewMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return { success: true, reviews: reviewsList };
    } catch (e: any) {
      console.error("Get Admin Reviews Error:", e);
      return { success: true, reviews: seedContractorReviews };
    }
  }
);

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
      await reviewsCol.deleteOne({ $or: [{ id: data.reviewId }, { _id: toQueryId(data.reviewId) }] });
      return { success: true };
    } catch (e: any) {
      console.error("Failed to delete review from DB:", e);
      return { success: false, error: "Failed to delete review from database." };
    }
  });

export const updateReviewStatusDb = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      productId: z.string(),
      reviewId: z.string(),
      status: z.enum(["Published", "Pending", "Flagged"]),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = await connectDB();
      if (!db) return { success: false, error: "Database unavailable" };
      const productsCol = db.collection("products");
      const reviewsCol = db.collection("reviews");

      const queryId = toQueryId(data.productId);

      await productsCol.updateOne(
        { _id: queryId, "reviews.id": data.reviewId },
        {
          $set: {
            "reviews.$.status": data.status,
          } as any,
        }
      );

      await reviewsCol.updateOne(
        { $or: [{ id: data.reviewId }, { _id: toQueryId(data.reviewId) }] },
        { $set: { status: data.status } }
      );

      return { success: true };
    } catch (e: any) {
      console.error("Failed to update review status:", e);
      return { success: false, error: "Failed to update review status." };
    }
  });


