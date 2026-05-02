import { Navigate } from "react-router-dom";

export default function DashboardRedirect() {
  // Check localStorage for auth token and user data
  const token = localStorage.getItem("auth_token");
  const userStr = localStorage.getItem("user");

  console.log("🔐 [DashboardRedirect] Checking auth...");
  console.log("   Token:", !!token, "User:", !!userStr);

  // No auth - go to login
  if (!token || !userStr) {
    console.log("❌ [DashboardRedirect] No auth - redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // Parse user and determine redirect
  try {
    const user = JSON.parse(userStr);
    const role = String(user?.role || "student").toLowerCase();
    
    let targetRoute = "/dashboard/student";
    if (role === "counsellor") {
      targetRoute = "/dashboard/counsellor";
    } else if (role === "admin") {
      targetRoute = "/dashboard/admin";
    }
    
    console.log("✅ [DashboardRedirect] Role:", role, "→ Redirecting to:", targetRoute);
    return <Navigate to={targetRoute} replace />;
  } catch (error) {
    console.error("❌ [DashboardRedirect] Parse error:", error);
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
}
