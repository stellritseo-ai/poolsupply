import { useState, useEffect } from "react";
import { useQuery, QueryClient } from "@tanstack/react-query";
import { getProductsDb } from "@/lib/api/products.functions";
import { products as defaultProducts } from "./default-products";

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
  brand: string;
  price: number;
  msrp: number; // For retail comparison
  rating: number;
  img: string;
  sku: string;
  category: string;
  stock: number;
  description: string;
  specs: Record<string, string>;
  reviews: Review[];
};

export const products = defaultProducts;

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

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getRelatedProducts(product: Product, limit = 4, productList?: Product[]): Product[] {
  const list = productList || products;
  return list
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
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
      if (res.success && res.products) {
        return res.products as Product[];
      }
      return products; // fallback to defaults if fail
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
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
