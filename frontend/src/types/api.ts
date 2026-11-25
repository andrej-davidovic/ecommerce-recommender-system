

export type UserRole = "admin" | "user";

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  category_ids: number[];
}

export interface CategoryResponse {
  id: number;
  name: string;
  name_sr: string | null;
  description: string | null;
  description_sr: string | null;
  parent_id: number | null;
}

export interface TagResponse {
  id: number;
  name: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  name_sr: string | null;
  description: string;
  description_sr: string | null;
  price: number;
  image_url: string | null;
  category: CategoryResponse;
  tags: TagResponse[];
  stock_quantity: number;
  is_active: boolean;
  average_rating: number | null;
  review_count: number;
  created_at: string;
}

export interface ReviewResponse {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name: string | null;
}

export interface CartItemResponse {
  id: string;
  product_id: string;
  product_name: string | null;
  product_name_sr: string | null;
  product_price: number | null;
  product_image_url: string | null;
  quantity: number;
  added_at: string;
}

export interface CartResponse {
  items: CartItemResponse[];
  total: number;
}

export interface WishlistItemResponse {
  id: string;
  product_id: string;
  added_at: string;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string | null;
  product_name_sr: string | null;
  quantity: number;
  unit_price: number;
}

export interface OrderResponse {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  stripe_payment_intent_id: string | null;
  items: OrderItem[];
  created_at: string;
}

export type RecommendationSource = "collaborative" | "cold_start" | "popular";

export interface RecommendationItem {
  product_id: string;
  score: number;
  source: RecommendationSource;
}

export interface RecommendationResponse {
  recommendations: RecommendationItem[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface PaymentIntentResponse {
  client_secret: string;
  order_id: string;
}

export interface ChatReferencedProduct {
  id: string;
  name: string;
  price: number;
}

export interface ChatResponse {
  reply: string;
  referenced_products: ChatReferencedProduct[];
}

export interface AnalyticsOverview {
  total_users: number;
  total_products: number;
  total_orders: number;
  pending_approvals: number;
}

export interface AlgorithmStatus {
  status: string;
  algorithm?: string;
  num_users?: number;
  num_products?: number;
  trained_at?: string | null;
  total_recommendations?: number;
  click_through_rate?: number;
  message?: string;
}

export interface RetrainResponse {
  status: string;
  num_users?: number;
  num_products?: number;
  trained_at?: string;
  message?: string;
}

export interface ProductQuery {
  page?: number;
  page_size?: number;
  search?: string;
  category_id?: number;
  tag?: string;
  sort_by?: "created_at" | "price" | "name";
  sort_order?: "asc" | "desc";
}
