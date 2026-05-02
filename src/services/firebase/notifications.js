import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { COLLECTIONS } from "./collections";

function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function sortByCreatedAtDesc(items) {
  return [...items].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

export async function pushNotification({ userId, title, message, type = "info" }) {
  return addDoc(collection(db, COLLECTIONS.notifications), {
    userId,
    title,
    message,
    type,
    isRead: false,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function watchUserNotifications(uid, callback) {
  if (!uid) return () => {};
  const q = query(
    collection(db, COLLECTIONS.notifications),
    where("userId", "==", uid)
  );
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(sortByCreatedAtDesc(rows));
  });
}

export function watchAllNotifications(callback) {
  const q = query(collection(db, COLLECTIONS.notifications), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function markNotificationAsRead(notificationId) {
  if (!notificationId) return;
  await updateDoc(doc(db, COLLECTIONS.notifications, notificationId), {
    isRead: true,
    read: true,
    readAt: serverTimestamp(),
  });
}

export async function markNotificationsAsRead(notificationIds = []) {
  await Promise.all(notificationIds.filter(Boolean).map((id) => markNotificationAsRead(id)));
}
