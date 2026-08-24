import { useState, useEffect } from "react";
import { useQuery, QueryClient } from "@tanstack/react-query";
import { getProductsDb, getProductByIdDb } from "@/lib/api/products.functions";
import { products as defaultProducts } from "./default-products";
import comingSoonImg from "@/assets/commingsoon.png";

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
};

export type Product = {
  id: string;
  name: string;
  displayName?: string;
  brand: string;
  price: number;
  msrp: number; // For retail comparison
  rating: number;
  img: string;
  sku: string;
  category: string;
  parentCategory?: string;
  subCategory?: string;
  stock: number;
  details?: string;
  description: string;
  seoKeywords?: string;
  specs: Record<string, string | undefined>;
  reviews: Review[];
};

export const products = defaultProducts;

export function getProductImage(imgUrl?: string): string {
  if (!imgUrl || typeof imgUrl !== "string" || imgUrl.trim() === "" || imgUrl.includes("placeholder") || imgUrl.includes("undefined") || imgUrl.includes("null")) {
    return comingSoonImg;
  }
  let clean = imgUrl.trim();
  if (!clean.startsWith("http") && !clean.startsWith("/")) {
    return comingSoonImg;
  }
  return clean.replace(/ /g, "%20");
}

export function getProductsList(): Product[] {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem("aquapro_db_products");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse products database from localStorage", e);
      }
    }
  }
  return products;
}

export function getProductById(id: string, customList?: Product[]): Product | undefined {
  if (!id) return undefined;
  
  // Combine customList, localStorage cached products, and default products for full coverage
  const primaryList = customList && customList.length > 0 ? customList : getProductsList();
  const combinedList = Array.from(new Set([...primaryList, ...products]));
  
  let cleanId = "";
  try {
    cleanId = decodeURIComponent(id).toLowerCase().trim();
  } catch (e) {
    cleanId = id.toLowerCase().trim();
  }

  // Stage 1: Exact ID or SKU match
  let found = combinedList.find((p) => 
    (p.id && p.id.toLowerCase() === cleanId) || 
    (p.sku && p.sku.toLowerCase() === cleanId)
  );
  if (found) return found;

  // Stage 2: Slugified SKU match (e.g. p-eco629t-1784934096946-1262 or p-000000-1787600530365)
  found = combinedList.find((p) => {
    if (!p.sku) return false;
    const slugSku = `p-${p.sku.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    return slugSku === cleanId || cleanId.startsWith(slugSku);
  });
  if (found) return found;

  // Stage 3: Partial SKU/ID inclusion match
  found = combinedList.find((p) => {
    const pId = p.id ? p.id.toLowerCase() : "";
    const pSku = p.sku ? p.sku.toLowerCase() : "";
    return (
      (pId && pId.length >= 4 && (cleanId.includes(pId) || (cleanId.length >= 4 && pId.includes(cleanId)))) ||
      (pSku && pSku.length >= 4 && (cleanId.includes(pSku) || (cleanId.length >= 4 && pSku.includes(cleanId))))
    );
  });
  
  return found;
}

export function getRelatedProducts(product: Product, limit = 4, productList?: Product[]): Product[] {
  const list = productList || products;
  const targetCat = (product.category || "").toLowerCase().trim();
  const targetSub = (product.subCategory || "").toLowerCase().trim();

  const sameCategoryProducts = list.filter((p) => {
    if (!p.id || p.id === product.id) return false;
    const pCat = (p.category || "").toLowerCase().trim();
    const pSub = (p.subCategory || "").toLowerCase().trim();

    return (
      (targetCat && pCat === targetCat) ||
      (targetSub && pSub === targetSub) ||
      (targetCat && pSub === targetCat) ||
      (targetSub && pCat === targetSub)
    );
  });

  const sorted = sameCategoryProducts.sort((a, b) => {
    const aBrandMatch = a.brand && product.brand && a.brand.toLowerCase() === product.brand.toLowerCase();
    const bBrandMatch = b.brand && product.brand && b.brand.toLowerCase() === product.brand.toLowerCase();
    if (aBrandMatch && !bBrandMatch) return -1;
    if (!aBrandMatch && bBrandMatch) return 1;
    return (b.rating || 5) - (a.rating || 5);
  });

  return sorted.slice(0, limit);
}

export function invalidateProductsCache(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["product-detail"] });
}

export function useProductByIdQuery(id: string) {
  return useQuery({
    queryKey: ["product-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getProductByIdDb({ data: { id } });
      if (res.success && res.product) {
        return res.product as Product;
      }
      return getProductById(id) || null;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useProductsQuery() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProductsDb({ data: { limit: 500 } });
      if (res.success && res.products && res.products.length > 0) {
        return res.products as Product[];
      }
      return products; // fallback to defaults if fail
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      const res = await getProductsDb({ data: { category, limit: 2000 } });
      if (res.success && res.products && res.products.length > 0) {
        return res.products as Product[];
      }
      return products;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 10 * 60 * 1000,
  });
}

export function useProducts() {
  const query = useProductsQuery();
  return {
    products: query.data || [],
    isLoading: query.isLoading,
  };
}

export function syncLocalProducts(updatedProducts: Product[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("aquapro_products", JSON.stringify(updatedProducts));
      localStorage.setItem("aquapro_db_products", JSON.stringify(updatedProducts));
    } catch (e) {
      console.warn("Could not write products to localStorage:", e);
    }
  }
}

