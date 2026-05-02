/**
 * Role-Based Access Control (MongoDB Backend)
 * 
 * Migrated from Firebase to Express + MongoDB
 * Replaces: src/services/auth/roleBasedAccess.js
 * 
 * Provides role-based access control using backend API
 */

import api from "../api.js"; // Uses pre-configured axios instance

const API_BASE_URL = "http://localhost:3001/api";

// ─────────────────────────────────────────────────────────────
// Role Constants
// ─────────────────────────────────────────────────────────────

export const ROLES = {
  STUDENT: 'student',
  COUNSELLOR: 'counsellor', 
  ADMIN: 'admin'
};

// ─────────────────────────────────────────────────────────────
// Get Current User Role
// ─────────────────────────────────────────────────────────────

/**
 * Get the current user's role
 * 
 * FIREBASE (OLD):
 *   export function getCurrentUserRole() {
 *     return new Promise((resolve) => {
 *       const unsubscribe = auth.onAuthStateChanged(async (user) => {
 *         if (!user) {
 *           resolve(null);
 *           unsubscribe();
 *           return;
 *         }
 * 
 *         try {
 *           const idTokenResult = await user.getIdTokenResult(true);
 *           const role = idTokenResult.claims.role || user.role;
 *           resolve(role);
 *         } catch (error) {
 *           console.error('Error getting user role:', error);
 *           resolve(null);
 *         } finally {
 *           unsubscribe();
 *         }
 *       });
 *     });
 *   }
 * 
 * MONGODB (NEW):
 *   GET /api/user/current/profile (includes role in response)
 */
export async function getCurrentUserRole() {
  try {
    // Check if user is authenticated
    const token = localStorage.getItem("auth_token");
    if (!token) {
      return null;
    }

    // Fetch user profile which includes role
    const response = await api.get("/user/current/profile");
    
    return response.data?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────

/**
 * Get current user data
 * 
 * MONGODB:
 *   GET /api/user/current/profile
 */
export async function getCurrentUser() {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      return null;
    }

    const response = await api.get("/user/current/profile");
    return response.data || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Role Hierarchy and Permissions
// ─────────────────────────────────────────────────────────────

/**
 * Check if user has required role
 * 
 * Hierarchy: STUDENT (1) < COUNSELLOR (2) < ADMIN (3)
 * 
 * Examples:
 *   hasRequiredRole("admin", "counsellor")     → true (admin > counsellor)
 *   hasRequiredRole("counsellor", "admin")    → false (counsellor < admin)
 *   hasRequiredRole("student", "student")     → true (same role)
 */
export function hasRequiredRole(userRole, requiredRole) {
  if (!userRole || !requiredRole) return false;
  
  const roleHierarchy = {
    [ROLES.STUDENT]: 1,
    [ROLES.COUNSELLOR]: 2,
    [ROLES.ADMIN]: 3
  };

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
}

// ─────────────────────────────────────────────────────────────

/**
 * Check if user can access a specific resource
 * 
 * Rules:
 *   ADMIN: Can access anything
 *   COUNSELLOR: Can access students assigned to them
 *   STUDENT: Can only access their own data
 */
export function canAccessResource(userRole, resource, resourceId) {
  switch (userRole) {
    case ROLES.ADMIN:
      // Admins can access any resource
      return true;

    case ROLES.COUNSELLOR:
      // Counsellors can access assessments and progress
      return (
        resource === 'assessment' ||
        resource === 'progress' ||
        resource === 'student'
      );

    case ROLES.STUDENT:
      // Students can only access their own resources
      return resource === 'profile' || resource === 'assessment';

    default:
      return false;
  }
}

// ─────────────────────────────────────────────────────────────

/**
 * Check if user can edit a resource
 */
export function canEditResource(userRole, resource, userId, resourceOwnerId) {
  // Admin can edit anything
  if (userRole === ROLES.ADMIN) return true;

  // Counsellor can edit student data
  if (userRole === ROLES.COUNSELLOR) {
    return resource !== 'admin_settings';
  }

  // Student can only edit own profile
  if (userRole === ROLES.STUDENT) {
    return userId === resourceOwnerId;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────

/**
 * Check if user can delete a resource
 */
export function canDeleteResource(userRole, resource) {
  // Only admins can delete
  return userRole === ROLES.ADMIN;
}

// ─────────────────────────────────────────────────────────────
// User Fetching by Role
// ─────────────────────────────────────────────────────────────

/**
 * Get users by role
 * 
 * FIREBASE (OLD):
 *   export async function getUsersByRole(role) {
 *     const snapshot = await getDocs(
 *       query(collection(db, "users"), where("role", "==", role))
 *     );
 *     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 *   }
 * 
 * MONGODB (NEW):
 *   GET /api/user/role/:role
 */
export async function getUsersByRole(role) {
  try {
    const response = await api.get(`/user/role/${role}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`Error fetching users by role ${role}:`, error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────

/**
 * Get all counsellors
 * 
 * MONGODB:
 *   GET /api/user/counsellors/available
 */
export async function getAvailableCounsellors() {
  try {
    const response = await api.get("/user/counsellors/available");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching counsellors:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Hooks for React Components
// ─────────────────────────────────────────────────────────────

/**
 * React Hook: Get current user role
 * 
 * Usage:
 *   const { role, loading } = useUserRole();
 *   if (loading) return <p>Loading...</p>;
 *   if (role === ROLES.ADMIN) return <AdminPanel />;
 */
export function useUserRole() {
  const [role, setRole] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getCurrentUserRole()
      .then(setRole)
      .catch(err => {
        console.error("Error in useUserRole:", err);
        setRole(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { role, loading };
}

// ─────────────────────────────────────────────────────────────

/**
 * React Hook: Check if user has permission for resource
 * 
 * Usage:
 *   const canEdit = useCanEditResource("assessment", userId, resourceId);
 *   if (canEdit) return <EditButton />;
 */
export function useCanAccessResource(resource, resourceId) {
  const [can, setCan] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getCurrentUserRole()
      .then(role => {
        setCan(canAccessResource(role, resource, resourceId));
      })
      .catch(err => {
        console.error("Error in useCanAccessResource:", err);
        setCan(false);
      })
      .finally(() => setLoading(false));
  }, [resource, resourceId]);

  return { can, loading };
}

// ─────────────────────────────────────────────────────────────
// MIGRATION CHECKLIST
// ─────────────────────────────────────────────────────────────

/*
✅ MIGRATION CHANGES:

1. Removed Firebase imports:
   - OLD: import { auth } from "../firebase"
   - NEW: Using localStorage + backend API

2. Replaced auth.onAuthStateChanged():
   - OLD: Real-time listener that updates when user logs in/out
   - NEW: Fetch user role from /api/user/current/profile
   - Consider: Set up listener on token changes in localStorage

3. Authentication Token:
   - OLD: Firebase idTokenResult
   - NEW: localStorage.getItem("auth_token")
   - ADDED: Auto-redirect to login if token is invalid (in api.js)

4. Role Source:
   - OLD: user.getIdTokenResult(true).claims.role
   - NEW: response.data.role from /api/user/current/profile

5. User Fetching:
   - OLD: getDocs(query(collection(db, "users"), where("role", "==", role)))
   - NEW: api.get(`/user/role/${role}`)

✅ TESTING CHECKLIST:

  [ ] Test getCurrentUserRole() with logged-in user
  [ ] Test getCurrentUserRole() when not logged in (should return null)
  [ ] Test hasRequiredRole() with different role combinations
  [ ] Test canAccessResource() with different scenarios
  [ ] Test getUsersByRole("student")
  [ ] Test getAvailableCounsellors()
  [ ] Test useUserRole hook in a component
  [ ] Test useCanAccessResource hook in a component
  [ ] Test logout scenario (role should become null)
  [ ] Test login scenario (role should be fetched)
*/

// ─────────────────────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────

/*
// In a React component:

import {
  getCurrentUserRole,
  useUserRole,
  hasRequiredRole,
  canAccessResource,
  ROLES
} from "@/services/auth/roleBasedAccess";

// Option 1: Using async function
async function MyComponent() {
  const role = await getCurrentUserRole();
  
  if (role === ROLES.ADMIN) {
    return <AdminDashboard />;
  } else if (role === ROLES.COUNSELLOR) {
    return <CounsellorDashboard />;
  } else {
    return <StudentDashboard />;
  }
}

// Option 2: Using React hook (preferred)
export default function Dashboard() {
  const { role, loading } = useUserRole();

  if (loading) return <p>Loading...</p>;
  if (!role) return <p>Not authenticated</p>;

  return (
    <div>
      <h1>Welcome, {role}</h1>
      
      {role === ROLES.ADMIN && <AdminControls />}
      {role === ROLES.COUNSELLOR && <CounsellorControls />}
      {role === ROLES.STUDENT && <StudentControls />}
    </div>
  );
}

// Option 3: Conditional rendering
export default function ProfilePage() {
  const { can } = useCanAccessResource("profile", userId);

  if (!can) {
    return <p>You don't have permission to view this profile</p>;
  }

  return <ProfileForm />;
}
*/
