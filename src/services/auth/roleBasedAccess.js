import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export const ROLES = {
  STUDENT: "student",
  COUNSELLOR: "counsellor",
  ADMIN: "admin",
};

export function normalizeRole(role) {
  const normalized = String(role || "student").toLowerCase();
  return Object.values(ROLES).includes(normalized) ? normalized : ROLES.STUDENT;
}

export function hasRequiredRole(userRole, allowedRoles = []) {
  const role = normalizeRole(userRole);
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return false;
  return allowedRoles.includes(role);
}

export function canAccessOwnData(currentUserId, targetUserId) {
  return Boolean(currentUserId) && currentUserId === targetUserId;
}

export async function canCounsellorAccessStudent(counsellorId, studentId) {
  if (!counsellorId || !studentId) return false;
  const studentSnap = await getDoc(doc(db, "users", studentId));
  if (!studentSnap.exists()) return false;
  const student = studentSnap.data() || {};
  return String(student.role || "") === ROLES.STUDENT && student.assignedCounsellorId === counsellorId;
}

export async function canAccessUserData({ currentUserId, currentUserRole, targetUserId }) {
  const role = normalizeRole(currentUserRole);

  if (!currentUserId || !targetUserId) return false;
  if (role === ROLES.ADMIN) return true;
  if (role === ROLES.STUDENT) return canAccessOwnData(currentUserId, targetUserId);
  if (role === ROLES.COUNSELLOR) return canCounsellorAccessStudent(currentUserId, targetUserId);

  return false;
}

export async function getAccessScope({ currentUserId, currentUserRole }) {
  const role = normalizeRole(currentUserRole);

  if (role === ROLES.ADMIN) {
    return {
      canViewAllUsers: true,
      canViewAssignedStudents: true,
      canViewOwnOnly: false,
      role,
    };
  }

  if (role === ROLES.COUNSELLOR) {
    return {
      canViewAllUsers: false,
      canViewAssignedStudents: true,
      canViewOwnOnly: false,
      role,
      counsellorId: currentUserId,
    };
  }

  return {
    canViewAllUsers: false,
    canViewAssignedStudents: false,
    canViewOwnOnly: true,
    role: ROLES.STUDENT,
    studentId: currentUserId,
  };
}
