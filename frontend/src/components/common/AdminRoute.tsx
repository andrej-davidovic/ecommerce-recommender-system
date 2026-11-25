import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function AdminRoute() {
  const isAuth = useAuthStore((s) => !!s.accessToken);
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");

  if (!isAuth) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
