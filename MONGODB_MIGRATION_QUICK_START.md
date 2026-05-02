# MongoDB Migration - Frontend Quick Start

## Step 1: Update .env

Create `.env.local` in project root:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 2: Install Axios (if not already installed)

```bash
npm install axios
```

## Step 3: Update Key Components

### Login.jsx
```javascript
// REMOVE:
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";

// ADD:
import { loginUser } from "../services/auth.js";

// REPLACE the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { token, user } = await loginUser(email, password);
    if (user.role === "counsellor") navigate("/dashboard/counsellor");
    else if (user.role === "admin") navigate("/dashboard/admin");
    else navigate("/dashboard/student");
  } catch (error) {
    setServerError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Signup.jsx
```javascript
// REMOVE:
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { autoAssignCounsellor } from "../services/firebase/users";

// ADD:
import { registerUser } from "../services/auth.js";

// REPLACE the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { token, user } = await registerUser(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );
    // Counsellor auto-assignment happens on backend
    if (formData.role === "counsellor") navigate("/dashboard/counsellor");
    else if (formData.role === "admin") navigate("/dashboard/admin");
    else navigate("/dashboard/student");
  } catch (error) {
    setServerError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Profile.jsx (Profile Update)
```javascript
// REMOVE:
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// ADD:
import { updateUserProfile } from "../services/mongodb/users.js";

// REPLACE the save handler:
const handleSave = async () => {
  try {
    setSaving(true);
    const updatedUser = await updateUserProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
      // ... other fields
    });
    setSaved(true);
    toast.success("Profile updated successfully");
  } catch (error) {
    setError("Failed to save profile");
  } finally {
    setSaving(false);
  }
};
```

### Profile Image Upload
```javascript
// REMOVE:
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

// ADD:
import api from "../services/api.js";

// REPLACE the upload handler:
const handleImageUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post("/upload/profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    setProfileImage(response.data.imageUrl);
    toast.success("Profile image updated");
  } catch (error) {
    toast.error("Failed to upload image");
  }
};
```

### Dashboard.jsx (User Watcher)
```javascript
// REMOVE:
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase";

useEffect(() => {
  const unsub = onSnapshot(doc(db, "users", userId), (snap) => {
    if (snap.exists()) {
      setProfile(snap.data());
    }
  });
  return unsub;
}, [userId]);

// ADD:
import { watchCurrentUser } from "../services/mongodb/users.js";

useEffect(() => {
  const unsub = watchCurrentUser(userId, (user) => {
    setProfile(user);
  });
  return unsub;
}, [userId]);
```

### Assessment Submission
```javascript
// REMOVE:
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

await addDoc(collection(db, "assessments"), assessmentData);

// ADD:
import { submitAssessment } from "../services/mongodb/assessments.js";

await submitAssessment(assessmentData);
```

### Appointment Booking
```javascript
// REMOVE:
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

await addDoc(collection(db, "appointments"), appointmentData);

// ADD:
import api from "../services/api.js";

await api.post("/appointment/create", appointmentData);
```

## Step 4: Remove Firebase Files

```bash
# Delete Firebase configuration (no longer needed)
rm src/firebase.js

# Delete Firebase service files (keep mongodb replacements only)
rm -rf src/services/firebase/
# (But keep structure, just don't use them)
```

## Step 5: Update API Service Imports

Throughout your app, replace:
```javascript
// OLD
import { watchCurrentUser } from "../services/firebase/users";

// NEW  
import { watchCurrentUser } from "../services/mongodb/users.js";
```

## Step 6: Handle Authentication State

Create a new auth context or modify existing:

```javascript
import { useEffect, useState } from "react";
import { getCurrentUser, isAuthenticated } from "../services/auth.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setUser(user);
    setLoading(false);
  }, []);

  return { user, loading, isAuthenticated: isAuthenticated() };
}
```

## Step 7: Remove Firebase from Package.json

```bash
npm uninstall firebase
```

## Step 8: Test All Flows

✅ Login
✅ Signup
✅ Profile Update
✅ Image Upload
✅ Assessment Submission
✅ Appointment Booking
✅ Dashboard Display
✅ Progress Tracking

## Environment Setup

### .env.local (Frontend)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### backend/.env (Backend)
```
MONGODB_URI=mongodb://localhost:27017/student_wellness
PORT=5000
JWT_SECRET=your_secure_secret_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Run Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` | Check JWT token in localStorage, restart login |
| `CORS error` | Verify FRONTEND_URL in backend/.env |
| `Image upload fails` | Check /uploads folder exists, file size < 5MB |
| `DB connection error` | Start MongoDB: `mongod` or verify Atlas URI |
| `API 404 errors` | Ensure backend is running on port 5000 |

## What Stays the Same

✅ All React components
✅ All CSS/styling
✅ All UI/UX
✅ All business logic
✅ All workflows
✅ All features

## What Changes

❌ Firebase imports → API imports
❌ Firebase calls → API calls
❌ Real-time listeners → Polling (5s intervals)
❌ Firebase auth → JWT tokens
❌ Firebase storage → Multer + uploads folder

## Next: WebSocket Real-Time (Optional)

For true real-time feel, implement Socket.io:

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:5000");
socket.on("user-updated", (user) => {
  setProfile(user);
});
```

This replaces the 5-second polling with instant updates.

---

**Migration complete!** Your app now runs on MongoDB instead of Firebase while keeping 100% feature parity.
