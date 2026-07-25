import { useState, useEffect } from "react";
import { useQuery, QueryClient } from "@tanstack/react-query";
import { getProductsDb } from "@/lib/api/products.functions";
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
  
  // Combine customList and default products for full coverage
  const primaryList = customList && customList.length > 0 ? customList : products;
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

  // Stage 2: Slugified SKU match (e.g. p-eco629t-1784934096946-1262)
  found = combinedList.find((p) => {
    if (!p.sku) return false;
    const slugSku = `p-${p.sku.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    return slugSku === cleanId;
  });
  if (found) return found;

  // Stage 3: Partial SKU/ID inclusion match
  found = combinedList.find((p) => {
    const pId = p.id ? p.id.toLowerCase() : "";
    const pSku = p.sku ? p.sku.toLowerCase() : "";
    return (
      (pId && (cleanId.includes(pId) || pId.includes(cleanId))) ||
      (pSku && (cleanId.includes(pSku) || pSku.includes(cleanId)))
    );
  });
  
  return found;
}

export function getRelatedProducts(product: Product, limit = 4, productList?: Product[]): Product[] {
  const list = productList || products;
  return list
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand || p.parentCategory === product.parentCategory))
    .slice(0, limit);
}

export function invalidateProductsCache(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["products"] });
}

export function useProductsQuery() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProductsDb();
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
    localStorage.setItem("aquapro_products", JSON.stringify(updatedProducts));
  }
}
