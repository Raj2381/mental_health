/**
 * Authentication Service using Firebase
 * Handles user registration, login, and session management
 */

import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import {
  autoAssignCounsellor,
  ensureUserDocument,
  updateUserStreak,
} from "./firebase/users.js";

const googleProvider = new GoogleAuthProvider();

function mapFirebaseAuthError(error) {
  const errorMessages = {
    "auth/email-already-in-use": "Email already registered",
    "auth/weak-password": "Password must be at least 6 characters",
    "auth/invalid-email": "Invalid email format",
    "auth/network-request-failed": "Network connection failed. Please check your internet connection and try again.",
    "auth/internal-error": "Firebase service temporarily unavailable. Please try again.",
    "auth/user-not-found": "Invalid email or password",
    "auth/wrong-password": "Invalid email or password",
    "auth/user-disabled": "User account is disabled",
    "auth/too-many-requests": "Too many login attempts. Please try again later.",
    "auth/popup-closed-by-user": "Google sign-in was closed before completion",
    "auth/cancelled-popup-request": "Google sign-in was cancelled",
    "auth/requires-recent-login": "Please re-login and try again",
  };

  return errorMessages[error?.code] || error?.message || "Authentication failed";
}

export async function createUserIfNotExists(user) {
  if (!user?.uid) return null;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await ensureUserDocument(user.uid, {
      uid: user.uid,
      name: snap.data()?.name || user.displayName || "User",
      email: snap.data()?.email || user.email || "",
      role: snap.data()?.role || "student",
      photoURL: snap.data()?.photoURL || user.photoURL || "",
      profile: {
        ...(snap.data()?.profile || {}),
      },
    });
    return snap.data();
  }

  const newUser = {
    uid: user.uid,
    name: user.displayName || "User",
    email: user.email || "",
    role: "student",
    photoURL: user.photoURL || "",
    profileImage: user.photoURL || "",
  };

  await ensureUserDocument(user.uid, newUser);
  return newUser;
}

export async function signInWithGoogle() {
  try {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      await signInWithRedirect(auth, googleProvider);
      return { success: true, redirected: true };
    }

    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    await createUserIfNotExists(firebaseUser);
    const streakState = await updateUserStreak(firebaseUser.uid);

    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    const userData = userDoc.data() || {};
    const user = {
      _id: firebaseUser.uid,
      id: firebaseUser.uid,
      name: userData.name || firebaseUser.displayName || "User",
      email: userData.email || firebaseUser.email || "",
      role: userData.role || "student",
      profileImage: userData.profileImage || firebaseUser.photoURL || "",
      streak: streakState.streak,
      lastActiveDate: streakState.lastActiveDate,
    };

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth_token", firebaseUser.uid);

    return { success: true, user };
  } catch (error) {
    return { success: false, message: mapFirebaseAuthError(error) };
  }
}

export async function handleGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (!result?.user) return { success: false, user: null };

    const firebaseUser = result.user;
    await createUserIfNotExists(firebaseUser);
    const streakState = await updateUserStreak(firebaseUser.uid);

    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    const userData = userDoc.data() || {};
    const user = {
      _id: firebaseUser.uid,
      id: firebaseUser.uid,
      name: userData.name || firebaseUser.displayName || "User",
      email: userData.email || firebaseUser.email || "",
      role: userData.role || "student",
      profileImage: userData.profileImage || firebaseUser.photoURL || "",
      streak: streakState.streak,
      lastActiveDate: streakState.lastActiveDate,
    };

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth_token", firebaseUser.uid);

    return { success: true, user };
  } catch (error) {
    return { success: false, message: mapFirebaseAuthError(error), user: null };
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, message: mapFirebaseAuthError(error) };
  }
}

// ── Register user with Firebase
export async function registerUser(name, email, password, role = "student") {
  try {
    console.log("📝 [AUTH] Registering user:", email);
    
    // Create Firebase auth user
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCred.user;

    console.log("✅ [AUTH] Firebase user created:", firebaseUser.uid);

    // Save user data to Firestore
    await ensureUserDocument(firebaseUser.uid, {
      uid: firebaseUser.uid,
      name,
      email,
      role,
      photoURL: "",
      profileImage: "",
      profile: {
        name,
        email,
      },
    });

    console.log("✅ [AUTH] User data saved to Firestore");

    // Auto-assign counsellor to new students
    if (role === "student") {
      try {
        const assignedCounsellor = await autoAssignCounsellor(firebaseUser.uid);
        if (assignedCounsellor) {
          console.log("✅ [AUTH] Student assigned to counsellor:", assignedCounsellor.name);
        }
      } catch (err) {
        console.warn("⚠️  [AUTH] Failed to auto-assign counsellor:", err.message);
        // Don't fail registration if assignment fails
      }
    }

    // Create user object to return
    const user = {
      _id: firebaseUser.uid,
      id: firebaseUser.uid,
      name,
      email,
      role,
      profileImage: "",
    };

    // Store user in localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth_token", firebaseUser.uid);

    return { success: true, user };
  } catch (error) {
    console.error("❌ [AUTH] Registration error:", error.code, error.message);
    console.error("📊 [AUTH] Full error:", error);

    const message = mapFirebaseAuthError(error) || "Registration failed";
    console.error("❌ [AUTH] User message:", message);

    return {
      success: false,
      message,
    };
  }
}

// ── Login user with Firebase
export async function loginUser(email, password) {
  try {
    console.log("🔐 [AUTH] Login attempt:", email);

    // Sign in with Firebase
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCred.user;

    console.log("✅ [AUTH] Firebase authentication successful");

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (!userDoc.exists()) {
      console.warn("⚠️  [AUTH] User not found in Firestore, creating...");
      // Create basic user doc if it doesn't exist
      await ensureUserDocument(firebaseUser.uid, {
        uid: firebaseUser.uid,
        name: email.split("@")[0],
        email,
        role: "student",
        photoURL: "",
        profileImage: "",
      });
    }

    const userData = userDoc.data() || {};
    const user = {
      _id: firebaseUser.uid,
      id: firebaseUser.uid,
      name: userData.name || email.split("@")[0],
      email: userData.email || email,
      role: userData.role || "student",
      profileImage: userData.profileImage || "",
    };

    const streakState = await updateUserStreak(firebaseUser.uid);
    user.streak = streakState.streak;
    user.lastActiveDate = streakState.lastActiveDate;
    console.log("[AUTH] Streak synced:", streakState);

    // Store user in localStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth_token", firebaseUser.uid);

    console.log("✅ [AUTH] User logged in:", user.email);

    return { success: true, user };
  } catch (error) {
    console.error("❌ [AUTH] Login error:", error.code, error.message);
    console.error("📊 [AUTH] Full error:", error);

    const message = mapFirebaseAuthError(error) || "Login failed";
    console.error("❌ [AUTH] User message:", message);

    return {
      success: false,
      message,
    };
  }
}

// ── Logout user
export async function logoutUser() {
  try {
    await signOut(auth);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    console.log("✅ [AUTH] User logged out");
  } catch (error) {
    console.error("❌ [AUTH] Logout error:", error.message);
  }
}

// ── Get current user from localStorage
export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

// ── Check if user is authenticated
export function isAuthenticated() {
  return !!localStorage.getItem("auth_token");
}

// ── Setup authentication state listener
export function setupAuthListener(callback) {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      console.log("🔐 [AUTH] User authenticated:", firebaseUser.email);
      callback(firebaseUser);
    } else {
      console.log("🚪 [AUTH] User not authenticated");
      callback(null);
    }
  });
}
