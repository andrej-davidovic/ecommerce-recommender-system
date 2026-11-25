import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type {
  AlgorithmStatus,
  AnalyticsOverview,
  ProductResponse,
  RetrainResponse,
  UserResponse,
} from "@/types/api";

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const { data } = await api.get<AnalyticsOverview>(
        "/admin/analytics/overview",
      );
      return data;
    },
  });
}

export function useAdminUsers(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["admin", "users", page, pageSize],
    queryFn: async () => {
      const { data } = await api.get<UserResponse[]>("/admin/users", {
        params: { page, page_size: pageSize },
      });
      return data;
    },
  });
}

export function useApproveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.patch<UserResponse>(
        `/admin/users/${userId}/approve`,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.patch<UserResponse>(
        `/admin/users/${userId}/deactivate`,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useActivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.patch<UserResponse>(
        `/admin/users/${userId}/activate`,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

interface ProductPayload {
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category_id: number;
  stock_quantity: number;
  tag_names: string[];
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProductPayload) => {
      const { data } = await api.post<ProductResponse>("/products/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: string;
      payload: Partial<ProductPayload>;
    }) => {
      const { data } = await api.put<ProductResponse>(
        `/products/${vars.id}`,
        vars.payload,
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product", vars.id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useAlgorithmStatus() {
  return useQuery({
    queryKey: ["admin", "algorithm-status"],
    queryFn: async () => {
      const { data } = await api.get<AlgorithmStatus>(
        "/admin/recommendations/status",
      );
      return data;
    },
  });
}

export function useRetrain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<RetrainResponse>(
        "/admin/recommendations/retrain",
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "algorithm-status"] });
    },
  });
}
