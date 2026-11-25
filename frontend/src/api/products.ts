import { useQueries, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type {
  PaginatedResponse,
  ProductQuery,
  ProductResponse,
} from "@/types/api";

function buildParams(q: ProductQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (q.page) params.page = q.page;
  if (q.page_size) params.page_size = q.page_size;
  if (q.search) params.search = q.search;
  if (q.category_id) params.category_id = q.category_id;
  if (q.tag) params.tag = q.tag;
  if (q.sort_by) params.sort_by = q.sort_by;
  if (q.sort_order) params.sort_order = q.sort_order;
  return params;
}

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: ["products", query],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<ProductResponse>>(
        "/products/",
        { params: buildParams(query) },
      );
      return data;
    },
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<ProductResponse>(`/products/${id}`);
      return data;
    },
  });
}

export function useProductsByIds(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["product", id],
      staleTime: 60_000,
      queryFn: async () => {
        const { data } = await api.get<ProductResponse>(`/products/${id}`);
        return data;
      },
    })),
  });
}
