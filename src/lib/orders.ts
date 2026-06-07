import { useQuery } from "@tanstack/react-query";
import { getOrdersDb, Order } from "./api/orders.functions";

export function useOrders() {
  const query = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const result = await getOrdersDb();
      if (result?.success && result.orders) {
        return result.orders as Order[];
      }
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

export type { Order };
