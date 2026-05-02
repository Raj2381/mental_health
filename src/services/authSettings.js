import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

const DEFAULT_API_BASE = import.meta.env.VITE_ACCOUNT_SETTINGS_API_BASE || "";

function resolveEndpoint(path) {
  if (DEFAULT_API_BASE) {
    return `${DEFAULT_API_BASE}${path}`;
  }

  const projectId = "student-wellness-hub-692b9";
  const region = "us-central1";
  return `https://${region}-${projectId}.cloudfunctions.net/api${path}`;
}

function mapFirebaseError(error) {
  const code = error?.code || "";
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "Invalid password. Please try again.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait and retry.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error. Please check your internet connection.";
  }
  if (code === "auth/requires-recent-login") {
    return "Please re-login and try again.";
  }
  return error?.message || "Something went wrong. Please try again.";
}

async function authorizedPost(path, body = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Unauthorized access");
  }

  const idToken = await user.getIdToken(true);
  const response = await fetch(resolveEndpoint(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}

export async function sendResetLink(email) {
  try {
    if (!email) {
      throw new Error("No email found for this account");
    }
    await sendPasswordResetEmail(auth, email);
    return { ok: true };
  } catch (error) {
    throw new Error(mapFirebaseError(error));
  }
}

export async function revokeSessions(uid) {
  try {
    if (!uid) throw new Error("Invalid user session");
    await authorizedPost("/revokeSessions", { uid });
    await signOut(auth);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    return { ok: true };
  } catch (error) {
    throw new Error(mapFirebaseError(error));
  }
}

export async function deleteUserData(uid) {
  try {
    if (!uid) throw new Error("Invalid user ID");
    await authorizedPost("/deleteUserData", { uid });
    return { ok: true };
  } catch (error) {
    throw new Error(mapFirebaseError(error));
  }
}

export async function deleteAccount(email, password) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Unauthorized access");

    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
    await deleteUserData(user.uid);
    await deleteUser(user);

    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");

    return { ok: true };
  } catch (error) {
    throw new Error(mapFirebaseError(error));
  }
}
