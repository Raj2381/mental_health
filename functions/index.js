import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();

const auth = getAuth();
const db = getFirestore();

function parseBearerToken(authHeader = "") {
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice(7).trim();
}

async function authenticateRequest(req, res) {
  try {
    const idToken = parseBearerToken(req.headers.authorization || "");
    if (!idToken) {
      res.status(401).json({ ok: false, message: "Missing authorization token" });
      return null;
    }

    const decoded = await auth.verifyIdToken(idToken, true);
    return decoded;
  } catch {
    res.status(401).json({ ok: false, message: "Unauthorized" });
    return null;
  }
}

async function deleteUserDocuments(uid) {
  const fixedDocTargets = [
    { collection: "users", docId: uid },
    { collection: "assessments", docId: uid },
    { collection: "progress", docId: uid },
    { collection: "messages", docId: uid },
  ];

  await Promise.all(
    fixedDocTargets.map(async ({ collection, docId }) => {
      try {
        await db.collection(collection).doc(docId).delete();
      } catch {
        return;
      }
    })
  );

  const queryTargets = [
    { collection: "assessments", field: "userId", value: uid },
    { collection: "progress", field: "userId", value: uid },
    { collection: "messages", field: "userId", value: uid },
    { collection: "messages", field: "senderId", value: uid },
    { collection: "messages", field: "receiverId", value: uid },
    { collection: "dailyActivities", field: "userId", value: uid },
    { collection: "dailyMetrics", field: "userId", value: uid },
    { collection: "chats", field: "studentId", value: uid },
    { collection: "chats", field: "counsellorId", value: uid },
  ];

  for (const target of queryTargets) {
    try {
      const snapshot = await db
        .collection(target.collection)
        .where(target.field, "==", target.value)
        .get();

      if (snapshot.empty) continue;

      const batch = db.batch();
      snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();
    } catch {
      continue;
    }
  }
}

export const api = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  const path = (req.path || req.url || "").split("?")[0];

  if (path.endsWith("/api/revokeSessions")) {
    const decoded = await authenticateRequest(req, res);
    if (!decoded) return;

    try {
      const targetUid = req.body?.uid || decoded.uid;
      if (targetUid !== decoded.uid) {
        res.status(403).json({ ok: false, message: "Forbidden" });
        return;
      }

      await auth.revokeRefreshTokens(targetUid);
      res.status(200).json({ ok: true, message: "Sessions revoked" });
    } catch {
      res.status(500).json({ ok: false, message: "Failed to revoke sessions" });
    }
    return;
  }

  if (path.endsWith("/api/deleteUserData")) {
    const decoded = await authenticateRequest(req, res);
    if (!decoded) return;

    try {
      const targetUid = req.body?.uid || decoded.uid;
      if (targetUid !== decoded.uid) {
        res.status(403).json({ ok: false, message: "Forbidden" });
        return;
      }

      await deleteUserDocuments(targetUid);
      res.status(200).json({ ok: true, message: "User data deleted" });
    } catch {
      res.status(500).json({ ok: false, message: "Failed to delete user data" });
    }
    return;
  }

  res.status(404).json({ ok: false, message: "Not found" });
});
