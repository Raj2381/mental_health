import { Navigate, useLocation } from "react-router-dom";

export default function RoleRoute({ allow = [], children }) {
  const location = useLocation();
  
  // Synchronously check localStorage on every render
  const token = localStorage.getItem("auth_token");
  const userStr = localStorage.getItem("user");
  
  console.log("🔐 [RoleRoute] Checking auth for route:", location.pathname);
  console.log("   Token present:", !!token, "User present:", !!userStr);

  // No auth - redirect to login
  if (!token || !userStr) {
    console.log("❌ [RoleRoute] No auth found - redirecting to /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Try to parse user
  let user = null;
  let role = null;
  
  try {
    user = JSON.parse(userStr);
    role = String(user?.role || "student").toLowerCase();
    console.log("✅ [RoleRoute] User authenticated with role:", role);
  } catch (error) {
    console.error("❌ [RoleRoute] Error parsing user:", error);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user's role is allowed for this route
  if (!role || !allow.includes(role)) {
    console.log("⚠️ [RoleRoute] Role mismatch - user:", role, "allowed:", allow);
    
    // If role doesn't match, redirect to user's default dashboard
    let fallback = "/dashboard/student";
    if (role === "counsellor") fallback = "/dashboard/counsellor";
    if (role === "admin") fallback = "/dashboard/admin";
    
    return <Navigate to={fallback} replace />;
  }

  // User has correct role - render
  console.log("✅ [RoleRoute] Access granted - rendering component");
  return children;
}
