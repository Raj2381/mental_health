# Firebase → MongoDB Migration - Quick Reference

## ✅ MIGRATION COMPLETE - ALL SYSTEMS GO

---

## Quick Start

### 1. Login/Auth
```javascript
import { loginUser, getCurrentUser } from "../services/auth.js";

// Login
const { token, user } = await loginUser("user@email.com", "password");

// Get current user anytime
const user = getCurrentUser();
const userId = user._id;  // Use this for API calls, NOT Firebase UID
```

### 2. Fetch Data from Backend
```javascript
import api from "../services/api.js";

// JWT token auto-injected, just make request
const response = await api.get("/user/current/profile");
console.log(response.data);
```

### 3. Components Pattern
```javascript
import { getCurrentUser } from "../services/auth.js";
import { getUser } from "../services/mongodb/users.js";

useEffect(() => {
  const user = getCurrentUser();
  if (!user?._id) return;
  
  getUser(user._id).then(setData);
}, []);
```

---

## API Endpoints (All Require JWT Token)

```
GET    /api/user/current/profile      - Get logged-in user
PUT    /api/user/current/profile      - Update user
GET    /api/assessment                - List assessments
POST   /api/assessment                - Submit assessment
GET    /api/progress                  - Get progress
PUT    /api/progress                  - Update progress
GET    /api/appointment               - List appointments
POST   /api/appointment               - Create appointment
```

---

## Key Changes Made

### ❌ OLD (Firebase)
```javascript
import { auth, db } from "../firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

const uid = auth.currentUser.uid;  // Firebase UID
const userRef = doc(db, "users", uid);
const unsub = onSnapshot(userRef, (snap) => {...});
```

### ✅ NEW (MongoDB)
```javascript
import { getCurrentUser } from "../services/auth.js";
import { getUser } from "../services/mongodb/users.js";

const userId = getCurrentUser()._id;  // MongoDB ID
const userData = await getUser(userId);
```

---

## Files Modified in Session 2

| File | Change | Status |
|------|--------|--------|
| Dashboard.jsx | Removed upsertDailyMetric (undefined function) | ✅ |
| assessments.js | Fixed endpoints (query params instead of URL paths) | ✅ |
| Progress.jsx | Removed Firebase, uses JWT + MongoDB polling | ✅ |
| Attendance.jsx | Removed Firebase, uses MongoDB API | ✅ |
| Messages.jsx | Removed Firebase, uses MongoDB API | ✅ |
| ProgressAndRewards.jsx | Removed Firebase, uses MongoDB API | ✅ |
| CounsellorDashboard.jsx | Fixed auth.currentUser undefined ref | ✅ |

---

## Compilation Status: ✅ 0 ERRORS

```
✅ Dashboard.jsx         - No errors
✅ Profile.jsx           - No errors  
✅ Assessment.jsx        - No errors
✅ Progress.jsx          - No errors
✅ Attendance.jsx        - No errors
✅ Messages.jsx          - No errors
✅ ProgressAndRewards    - No errors
✅ CounsellorDashboard   - No errors
✅ api.js                - No errors
✅ auth.js               - No errors
```

---

## Testing Commands

### Start Backend
```bash
cd backend
npm start
# Runs on http://localhost:3001
```

### Start Frontend
```bash
npm run dev
# Runs on http://localhost:5173
```

### Test Login
```javascript
// In browser console
const { loginUser } = await import('/src/services/auth.js');
const result = await loginUser("test@example.com", "password");
console.log(result.token);
```

---

## Common Patterns

### Load User Data
```javascript
const [user, setUser] = useState(null);

useEffect(() => {
  const currentUser = getCurrentUser();
  if (!currentUser?._id) return;
  
  getUser(currentUser._id).then(setUser);
}, []);
```

### Submit Form Data
```javascript
const handleSubmit = async (formData) => {
  try {
    const response = await api.put("/user/current/profile", formData);
    console.log("Updated:", response.data);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
```

### Handle Errors
```javascript
try {
  await api.get("/endpoint");
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired - auto-redirect to login
    console.log("Re-authenticating...");
  } else if (error.response?.status === 404) {
    console.log("Data not found");
  } else {
    console.log("Network error:", error.message);
  }
}
```

---

## Token Management

### Auto-Handled by System
```javascript
// Stored in localStorage on login
localStorage.getItem("auth_token")

// Auto-injected in all API requests
Authorization: Bearer ${token}

// Auto-cleared on 401 (Unauthorized)
// User auto-redirected to /login
```

### Manual Token Operations
```javascript
// Get token
const token = localStorage.getItem("auth_token");

// Clear token (logout)
localStorage.removeItem("auth_token");

// Verify token exists
if (!localStorage.getItem("auth_token")) {
  window.location.href = "/login";
}
```

---

## Debug Mode

### Enable Logging
```javascript
// In any component
import api from "../services/api.js";

// All requests will log
api.interceptors.request.use(config => {
  console.log("🚀 Request:", config.method.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log("✅ Response:", response.data);
    return response;
  },
  error => {
    console.error("❌ Error:", error.response?.data);
    return Promise.reject(error);
  }
);
```

### Check Current User
```javascript
import { getCurrentUser } from "../services/auth.js";

console.log("Current User:", getCurrentUser());
console.log("User ID:", getCurrentUser()?._id);
console.log("Token:", localStorage.getItem("auth_token"));
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 404 User Not Found | Verify user exists in MongoDB, use JWT-based endpoint |
| 401 Unauthorized | Token expired, login again |
| CORS Error | Backend CORS misconfigured, check allowed origins |
| Assessment Submit Fails | Use `POST /api/assessment` NOT `/api/assessment/submit` |
| Dashboard Won't Load | Check console for Firebase references, verify getCurrentUser() works |
| Profile Won't Save | Ensure JWT token in localStorage, verify PUT endpoint works |

---

## Before You Ask Questions

1. ✅ Check browser console for errors
2. ✅ Verify backend is running on port 3001
3. ✅ Verify JWT token exists: `localStorage.getItem("auth_token")`
4. ✅ Check Network tab in DevTools for failed requests
5. ✅ Verify all imports are from `../services/mongodb/` (not Firebase)
6. ✅ Ensure using `getCurrentUser()._id` (not Firebase UID)

---

## Production Checklist

- [ ] Backend running on production server
- [ ] Environment variables set (API_URL, JWT_SECRET)
- [ ] HTTPS enforced
- [ ] CORS configured for production domain
- [ ] MongoDB connection secured
- [ ] Error tracking enabled (Sentry, etc)
- [ ] Frontend built: `npm run build`
- [ ] All tests passing
- [ ] Staging deployment successful

---

**Migration Status:** ✅ Complete
**Ready to Test:** ✅ Yes
**Ready to Deploy:** ⏳ After QA Testing
**Estimated Testing Time:** 1-2 hours

---

For detailed information, see: `FIREBASE_MONGODB_MIGRATION_GUIDE.md`
