import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { CategoryResponse } from "@/types/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await api.get<CategoryResponse[]>("/categories/");
      return data;
    },
  });
}
