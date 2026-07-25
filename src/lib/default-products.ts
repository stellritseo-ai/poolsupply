import { Product } from "./products";
import catalogProducts from "./catalog-products.json";

export const products: Product[] = catalogProducts as unknown as Product[];
