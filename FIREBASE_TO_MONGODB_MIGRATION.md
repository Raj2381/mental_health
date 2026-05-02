# Firebase to MongoDB Migration Guide

## Overview
This document explains how the Student Wellness App has been migrated from Firebase to MongoDB + Node.js + Express backend.

## Architecture Changes

### Before (Firebase)
```
Frontend (React) ←→ Firebase SDK ←→ Firestore, Auth, Storage
```

### After (MongoDB)
```
Frontend (React) ←→ API (Axios) ←→ Express Server ←→ MongoDB
```

## File Structure

### Backend
```
backend/
├── server.js                 # Main Express app
├── package.json             # Dependencies
├── .env                     # Environment variables
├── models/
│   ├── User.js             # User schema
│   ├── Assessment.js       # Assessment schema
│   ├── Progress.js         # Daily progress schema
│   └── Appointment.js      # Appointment schema
└── routes/
    ├── auth.js             # Authentication endpoints
    ├── user.js             # User management endpoints
    ├── assessment.js       # Assessment endpoints
    ├── progress.js         # Progress endpoints
    ├── appointment.js      # Appointment endpoints
    └── upload.js           # Image upload endpoints
```

### Frontend
```
src/
├── services/
│   ├── api.js              # Axios configuration
│   ├── auth.js             # Auth API calls (replaces Firebase auth)
│   └── mongodb/
│       ├── users.js        # User API calls (replaces firebase/users.js)
│       ├── assessments.js  # Assessment API calls
│       ├── progress.js     # Progress API calls
│       └── appointments.js # Appointment API calls
```

## Setup Instructions

### Backend Setup

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Setup MongoDB**
   - Option A: Local MongoDB
     ```bash
     mongod
     ```
   - Option B: MongoDB Atlas (Cloud)
     - Create account at mongodb.com/cloud/atlas
     - Get connection string

3. **Configure environment**
```bash
# backend/.env
MONGODB_URI=mongodb://localhost:27017/student_wellness
PORT=5000
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
```

4. **Start backend**
```bash
npm run dev
```

### Frontend Setup

1. **Configure API endpoint**
```bash
# .env.local
REACT_APP_API_URL=http://localhost:5000/api
```

2. **Install dependencies**
```bash
npm install
```

3. **Start frontend**
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-token` - Verify JWT token

### Users
- `GET /api/user/:id` - Get user by ID
- `GET /api/user/current/profile` - Get current user profile
- `PUT /api/user/update` - Update user profile
- `GET /api/user/role/:role` - Get users by role
- `GET /api/user/counsellors/available` - Get available counsellors

### Assessment
- `POST /api/assessment/submit` - Submit assessment
- `GET /api/assessment/:userId` - Get latest assessment
- `GET /api/assessment/:userId/history` - Get assessment history
- `GET /api/assessment/user/:userId/latest` - Get latest assessment

### Progress
- `GET /api/progress/:userId` - Get today's progress
- `GET /api/progress/:userId/history` - Get last 30 days progress
- `POST /api/progress/update` - Update progress
- `POST /api/progress/task-complete` - Mark task as complete

### Appointments
- `POST /api/appointment/create` - Create appointment
- `GET /api/appointment/student/:studentId` - Get student appointments
- `GET /api/appointment/counsellor/:counsellorId` - Get counsellor appointments
- `PUT /api/appointment/:id/status` - Update appointment status
- `DELETE /api/appointment/:id` - Delete appointment

### Upload
- `POST /api/upload/profile-image` - Upload profile image
- `POST /api/upload/generic` - Upload generic file

## Key Changes in Frontend

### 1. Authentication Flow

**Before (Firebase)**
```javascript
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

const userCredential = await createUserWithEmailAndPassword(auth, email, password);
```

**After (MongoDB)**
```javascript
import { registerUser } from "../services/auth.js";

const { token, user } = await registerUser(name, email, password, role);
```

### 2. User Profile Updates

**Before (Firebase)**
```javascript
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

await setDoc(doc(db, "users", userId), { name, email, ... });
```

**After (MongoDB)**
```javascript
import { updateUserProfile } from "../services/mongodb/users.js";

const updatedUser = await updateUserProfile({ name, email, ... });
```

### 3. Real-time Listeners

**Before (Firebase)**
```javascript
import { onSnapshot, doc } from "firebase/firestore";

const unsub = onSnapshot(doc(db, "users", userId), (snap) => {
  if (snap.exists()) {
    setUser(snap.data());
  }
});
```

**After (MongoDB - Polling)**
```javascript
import { watchCurrentUser } from "../services/mongodb/users.js";

const unsub = watchCurrentUser(userId, (user) => {
  setUser(user);
});
```

### 4. Image Upload

**Before (Firebase Storage)**
```javascript
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

const fileRef = ref(storage, `avatars/${userId}`);
await uploadBytes(fileRef, file);
```

**After (MongoDB with Multer)**
```javascript
import api from "../services/api.js";

const formData = new FormData();
formData.append("file", file);
const response = await api.post("/upload/profile-image", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
```

## Data Persistence

### Firebase → MongoDB Schema Mapping

**Users Collection**
```
Firebase: users/{userId}
MongoDB:  users collection, document ID = _id
```

**Assessment Collection**
```
Firebase: assessments/{docId}
MongoDB:  assessments collection, indexed by userId
```

**Daily Progress**
```
Firebase: users/{userId}/dailyPlans/{date}
MongoDB:  progress collection, unique index on (userId, date)
```

**Appointments**
```
Firebase: appointments/{docId}
MongoDB:  appointments collection, indexed by studentId and counsellorId
```

## Real-Time Updates Strategy

### Firebase Real-Time Listeners
Firebase provided true real-time updates via Firestore listeners.

### MongoDB Alternatives

1. **Polling** (Current Implementation)
   - Updates every 5 seconds
   - Simple to implement
   - More server/client load
   - Used for: Profile, Assessments, Progress

2. **WebSockets** (Future Enhancement)
   - Use Socket.io for true real-time
   - Lower latency
   - Better for chat/messaging

3. **Server-Sent Events** (Future Enhancement)
   - One-way server to client
   - Good for notifications

## Authentication

### Token-based Authentication (JWT)

1. **Login/Register**
   - Client sends credentials
   - Server generates JWT token
   - Token stored in localStorage

2. **Authenticated Requests**
   - Client includes token in Authorization header
   - Server validates token
   - Request processed if valid

3. **Token Expiry**
   - Default: 7 days
   - Configurable via JWT_EXPIRE

## Image Upload

### Flow
1. User selects file
2. Client sends to `/api/upload/profile-image`
3. Server saves to `backend/uploads/` folder
4. Returns image URL
5. URL stored in MongoDB user record
6. Frontend loads from `/uploads/` endpoint

### URL Format
```
Local: http://localhost:5000/uploads/avatar-1234567890.jpg
Production: https://yourdomain.com/uploads/avatar-1234567890.jpg
```

## Testing Checklist

- [ ] User registration
- [ ] User login
- [ ] Profile update
- [ ] Profile image upload
- [ ] Assessment submission
- [ ] Daily progress update
- [ ] Appointment booking
- [ ] Appointment accept/reject
- [ ] Dashboard real-time updates
- [ ] Counsellor dashboard
- [ ] Admin dashboard

## Troubleshooting

### 401 Unauthorized
- Check JWT token in localStorage
- Verify token hasn't expired
- Check Authorization header format

### CORS Error
- Verify FRONTEND_URL in backend .env
- Check frontend API_URL

### MongoDB Connection Failed
- Verify MongoDB is running
- Check MONGODB_URI in .env
- Verify network access (if using Atlas)

### Image Upload Failed
- Check file size (max 5MB)
- Verify file type is image
- Check /uploads folder exists

## Performance Considerations

1. **Database Indexes**
   - Compound indexes on (userId, date)
   - Helps with progress queries

2. **Query Optimization**
   - Limit to 30 days for history queries
   - Use pagination for large datasets

3. **Caching**
   - Consider implementing Redis for user data
   - Cache frequently accessed assessments

4. **Polling Interval**
   - Currently 5 seconds
   - Can be adjusted based on UX needs
   - Consider WebSockets for real-time feel

## Deployment

### Backend (Heroku/Railway/Render)
```bash
# Set environment variables
MONGODB_URI=<atlas_connection_string>
JWT_SECRET=<strong_secret>
FRONTEND_URL=<production_url>

npm run start
```

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Set environment
REACT_APP_API_URL=<backend_url>
```

## Next Steps

1. Implement WebSockets for true real-time (Socket.io)
2. Add Redis caching layer
3. Implement proper error logging (Sentry)
4. Add rate limiting
5. Implement refresh token rotation
6. Add database backups strategy
