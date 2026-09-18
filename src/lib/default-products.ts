import { Product } from "./products";
import catalogProducts from "./catalog-products.json";

export const products: Product[] = (catalogProducts as any[]).map((p) => {
  const rawPrice = Number(p.price) || 0;
  const rawSale =
    p.salePrice != null && Number(p.salePrice) > 0
      ? Number(p.salePrice)
      : p.msrp && Number(p.msrp) > rawPrice
        ? Number(p.msrp)
        : Math.round(rawPrice * 1.25 * 100) / 100;
  return {
    ...p,
    wholesalePrice: rawPrice,
    price: rawSale,
    salePrice: rawSale,
  };
}) as Product[];
