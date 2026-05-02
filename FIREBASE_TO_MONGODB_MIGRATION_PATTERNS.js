/**
 * FIREBASE TO MONGODB MIGRATION GUIDE
 * 
 * This file documents all Firebase → Backend API replacements
 * Use these patterns to migrate your existing Firebase code
 * 
 * Base API URL: http://localhost:3001/api
 */

// ─────────────────────────────────────────────────────────────
// HELPER: API Configuration
// ─────────────────────────────────────────────────────────────

const API_BASE_URL = "http://localhost:3001/api";

// Helper to make API calls
async function apiCall(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("auth_token") || ""}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// MIGRATION PATTERNS
// ─────────────────────────────────────────────────────────────

/**
 * PATTERN 1: getDocs → GET request
 * 
 * Firebase:
 *   const snapshot = await getDocs(collection(db, "users"))
 *   const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
 * 
 * MongoDB:
 *   const data = await apiCall("/user/role/student")
 *   const users = data (backend returns array directly)
 */

// Example:
async function getUsersByRole(role) {
  try {
    const users = await apiCall(`/user/role/${role}`);
    return users; // Backend returns array directly
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────

/**
 * PATTERN 2: addDoc → POST request
 * 
 * Firebase:
 *   await addDoc(collection(db, "notifications"), {
 *     userId: "123",
 *     message: "Hello"
 *   })
 * 
 * MongoDB:
 *   await apiCall("/notification", "POST", {
 *     userId: "123",
 *     message: "Hello"
 *   })
 */

// Example:
async function pushNotification(data) {
  try {
    const result = await apiCall("/notification", "POST", {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || "info",
      isRead: false,
      createdAt: new Date().toISOString()
    });
    return result;
  } catch (error) {
    console.error("Failed to push notification:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────

/**
 * PATTERN 3: setDoc → PUT/POST request
 * 
 * Firebase:
 *   await setDoc(doc(db, "users", userId), {
 *     name: "John",
 *     email: "john@example.com"
 *   })
 * 
 * MongoDB:
 *   await apiCall("/user/update", "PUT", {
 *     name: "John",
 *     email: "john@example.com"
 *   })
 * 
 * NOTE: Depends on backend endpoint. Check if it expects PUT or POST
 */

// Example:
async function updateUserProfile(profileData) {
  try {
    const result = await apiCall("/user/update", "PUT", profileData);
    return result;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────

/**
 * PATTERN 4: updateDoc → PUT/PATCH request
 * 
 * Firebase:
 *   await updateDoc(doc(db, "notifications", notifId), {
 *     isRead: true,
 *     readAt: serverTimestamp()
 *   })
 * 
 * MongoDB:
 *   await apiCall("/notification/:id", "PUT", {
 *     isRead: true,
 *     readAt: new Date().toISOString()
 *   })
 */

// Example:
async function markNotificationAsRead(notificationId) {
  try {
    await apiCall(`/notification/${notificationId}`, "PUT", {
      isRead: true,
      readAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to mark as read:", error);
  }
}

// ─────────────────────────────────────────────────────────────

/**
 * PATTERN 5: onSnapshot → Polling with setInterval
 * 
 * Firebase: Real-time listener
 *   const unsubscribe = onSnapshot(q, (snap) => {
 *     const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
 *     setNotifications(data)
 *   })
 * 
 * MongoDB: Polling alternative
 *   const interval = setInterval(() => {
 *     fetchNotifications()
 *   }, 3000) // Every 3 seconds
 * 
 *   return () => clearInterval(interval)
 */

// Example:
function watchUserNotifications(userId, callback) {
  if (!userId) return () => {};

  // Poll every 3 seconds instead of real-time
  const interval = setInterval(async () => {
    try {
      const notifications = await apiCall(`/user/${userId}/notifications`);
      callback(notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, 3000);

  // Return unsubscribe function
  return () => clearInterval(interval);
}

// ─────────────────────────────────────────────────────────────

/**
 * PATTERN 6: Firebase Auth → API Auth
 * 
 * Firebase:
 *   const user = await signInWithEmailAndPassword(auth, email, password)
 * 
 * MongoDB:
 *   const response = await apiCall("/auth/login", "POST", {
 *     email,
 *     password
 *   })
 *   localStorage.setItem("auth_token", response.token)
 */

// Example:
async function loginUser(email, password) {
  try {
    const response = await apiCall("/auth/login", "POST", {
      email,
      password
    });

    if (response.token) {
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────

/**
 * PATTERN 7: serverTimestamp() → new Date().toISOString()
 * 
 * Firebase:
 *   { createdAt: serverTimestamp() }
 * 
 * MongoDB:
 *   { createdAt: new Date().toISOString() }
 * 
 * Or let backend handle it with Mongoose timestamps
 */

// ─────────────────────────────────────────────────────────────

/**
 * PATTERN 8: Query filters → URL parameters or request body
 * 
 * Firebase:
 *   const q = query(
 *     collection(db, "assessments"),
 *     where("userId", "==", uid),
 *     orderBy("createdAt", "desc")
 *   )
 * 
 * MongoDB:
 *   Option 1 - URL Parameters:
 *     const assessments = await apiCall(`/assessment/user/${userId}?sort=desc`)
 * 
 *   Option 2 - Request body:
 *     const assessments = await apiCall("/assessment/query", "POST", {
 *       filters: { userId },
 *       sort: { createdAt: -1 }
 *     })
 */

// ─────────────────────────────────────────────────────────────
// COMMON MIGRATION CHECKLIST
// ─────────────────────────────────────────────────────────────

/*
✅ When replacing Firebase code, check:

1. [ ] Replace imports:
   - Remove: import { getDocs, addDoc, ... } from "firebase/firestore"
   - Keep: No imports needed, use apiCall function

2. [ ] Replace serverTimestamp():
   - Replace with: new Date().toISOString()

3. [ ] Replace real-time listeners (onSnapshot):
   - Replace with: setInterval + apiCall for polling
   - Or use WebSocket if backend supports it

4. [ ] Update error handling:
   - Firebase errors → try-catch around apiCall
   - Show user-friendly messages

5. [ ] Test with backend:
   - Verify API endpoints exist
   - Check response format matches expectations
   - Test error scenarios

6. [ ] Update data transformations:
   - Firebase: { id: doc.id, ...doc.data() }
   - MongoDB: Depends on backend response format
   - Usually: Just use response directly or map id field

7. [ ] Handle authentication:
   - Firebase: auth.currentUser
   - MongoDB: localStorage.getItem("auth_token")
   - Pass token in Authorization header

8. [ ] Remove Firebase files:
   - Keep: src/services/api.js (uses backend)
   - Remove: Firebase imports from components
   - Update: Any import { auth, db } references
*/

// ─────────────────────────────────────────────────────────────
// EXPORT FOR USE IN OTHER FILES
// ─────────────────────────────────────────────────────────────

export {
  apiCall,
  API_BASE_URL,
  getUsersByRole,
  pushNotification,
  updateUserProfile,
  markNotificationAsRead,
  watchUserNotifications,
  loginUser
};
