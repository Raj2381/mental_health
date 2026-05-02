/**
 * Notifications API Service (MongoDB Backend)
 * 
 * Migrated from Firebase to Express + MongoDB
 * Replaces: src/services/firebase/notifications.js
 * 
 * Usage: Use this instead of Firebase notifications
 */

const API_BASE_URL = "http://localhost:3001/api";

// Helper function for API calls
async function apiCall(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      }
    };

    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────

function toMillis(value) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function sortByCreatedAtDesc(items) {
  return [...items].sort((a, b) => 
    toMillis(b.createdAt) - toMillis(a.createdAt)
  );
}

// ─────────────────────────────────────────────────────────────
// MIGRATION FROM FIREBASE
// ─────────────────────────────────────────────────────────────

/**
 * Push a new notification
 * 
 * FIREBASE (OLD):
 *   export async function pushNotification({ userId, title, message, type = "info" }) {
 *     return addDoc(collection(db, COLLECTIONS.notifications), {
 *       userId,
 *       title,
 *       message,
 *       type,
 *       isRead: false,
 *       read: false,
 *       createdAt: serverTimestamp(),
 *     });
 *   }
 * 
 * MONGODB (NEW):
 *   POST /api/notification
 */
export async function pushNotification({ userId, title, message, type = "info" }) {
  try {
    const response = await apiCall("/notification", "POST", {
      userId,
      title,
      message,
      type: type || "info",
      isRead: false,
      read: false,
      createdAt: new Date().toISOString(),
    });
    
    return response;
  } catch (error) {
    console.error("Error pushing notification:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────

/**
 * Watch user's notifications in real-time (polling)
 * 
 * FIREBASE (OLD):
 *   export function watchUserNotifications(uid, callback) {
 *     if (!uid) return () => {};
 *     const q = query(
 *       collection(db, COLLECTIONS.notifications),
 *       where("userId", "==", uid)
 *     );
 *     return onSnapshot(q, (snap) => {
 *       const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
 *       callback(sortByCreatedAtDesc(rows));
 *     });
 *   }
 * 
 * MONGODB (NEW):
 *   GET /api/notification?userId=uid (with polling)
 */
export function watchUserNotifications(uid, callback) {
  if (!uid) return () => {};

  // Poll every 2 seconds (or adjust interval)
  const pollInterval = setInterval(async () => {
    try {
      const notifications = await apiCall(`/notification?userId=${uid}`);
      
      // Ensure it's an array
      const items = Array.isArray(notifications) ? notifications : [];
      
      callback(sortByCreatedAtDesc(items));
    } catch (error) {
      console.error("Error watching notifications:", error);
      // Still call callback with empty array to avoid UI breaking
      callback([]);
    }
  }, 2000); // Poll every 2 seconds

  // Return unsubscribe function
  return () => clearInterval(pollInterval);
}

// ─────────────────────────────────────────────────────────────

/**
 * Watch all notifications (admin/counsellor)
 * 
 * FIREBASE (OLD):
 *   export function watchAllNotifications(callback) {
 *     const q = query(
 *       collection(db, COLLECTIONS.notifications),
 *       orderBy("createdAt", "desc")
 *     );
 *     return onSnapshot(q, (snap) => {
 *       callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
 *     });
 *   }
 * 
 * MONGODB (NEW):
 *   GET /api/notification (with polling)
 */
export function watchAllNotifications(callback) {
  // Poll every 2 seconds
  const pollInterval = setInterval(async () => {
    try {
      const notifications = await apiCall("/notification");
      
      // Ensure it's an array
      const items = Array.isArray(notifications) ? notifications : [];
      
      callback(items);
    } catch (error) {
      console.error("Error watching all notifications:", error);
      callback([]);
    }
  }, 2000);

  // Return unsubscribe function
  return () => clearInterval(pollInterval);
}

// ─────────────────────────────────────────────────────────────

/**
 * Mark single notification as read
 * 
 * FIREBASE (OLD):
 *   export async function markNotificationAsRead(notificationId) {
 *     if (!notificationId) return;
 *     await updateDoc(doc(db, COLLECTIONS.notifications, notificationId), {
 *       isRead: true,
 *       read: true,
 *       readAt: serverTimestamp(),
 *     });
 *   }
 * 
 * MONGODB (NEW):
 *   PUT /api/notification/:id
 */
export async function markNotificationAsRead(notificationId) {
  if (!notificationId) return;

  try {
    await apiCall(`/notification/${notificationId}`, "PUT", {
      isRead: true,
      read: true,
      readAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────

/**
 * Mark multiple notifications as read
 * 
 * FIREBASE (OLD):
 *   export async function markNotificationsAsRead(notificationIds = []) {
 *     await Promise.all(
 *       notificationIds.filter(Boolean).map((id) => markNotificationAsRead(id))
 *     );
 *   }
 * 
 * MONGODB (NEW):
 *   PUT /api/notification/read/batch (or call individual)
 */
export async function markNotificationsAsRead(notificationIds = []) {
  try {
    const promises = notificationIds
      .filter(Boolean)
      .map((id) => markNotificationAsRead(id));
    
    await Promise.all(promises);
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// ADDITIONAL HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Get user's notifications (one-time fetch)
 * 
 * MONGODB:
 *   GET /api/notification?userId=uid
 */
export async function getUserNotifications(userId) {
  try {
    const notifications = await apiCall(`/notification?userId=${userId}`);
    return Array.isArray(notifications) ? notifications : [];
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return [];
  }
}

/**
 * Delete a notification
 * 
 * MONGODB:
 *   DELETE /api/notification/:id
 */
export async function deleteNotification(notificationId) {
  try {
    await apiCall(`/notification/${notificationId}`, "DELETE");
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────

/*
// In a React component:

import { watchUserNotifications, pushNotification } from "@/services/mongodb/notifications";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    // Start polling
    const unsubscribe = watchUserNotifications(userId, (data) => {
      setNotifications(data);
    });

    // Cleanup: stop polling when component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.message}</div>
      ))}
    </div>
  );
}
*/
