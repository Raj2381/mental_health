# Backend Connection Fix - Complete Guide

## 🎯 Problem
Login failing with **"Network Error"** or **"ERR_CONNECTION_REFUSED"** - Frontend cannot connect to backend.

## ✅ Solution

All fixes have been implemented. Follow these steps to get everything working.

---

## 📋 Step 1: Verify Backend is Running

### Start Backend Server
```bash
cd /Users/rajgupta/my-react-app/backend
npm start
```

### Expected Output
```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  🚀 SERVER RUNNING                                     ║
║  📍 Port: 3001                                         ║
║  🌐 URL: http://localhost:3001                         ║
║  📡 API: http://localhost:3001/api                     ║
║  🔗 Frontend: http://localhost:5173                    ║
║                                                        ║
║  Available Routes:                                     ║
║  ✓ GET  /api/health                                    ║
║  ✓ POST /api/auth/login                                ║
║  ✓ POST /api/auth/register                             ║
║                                                        ║
║  Database: ✅ Connected                                ║
║  CORS: ✅ Enabled                                      ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

### If Backend Doesn't Start
```bash
# Check Node version
node --version  # Should be 16.x or higher

# Check npm packages
npm install
npm start
```

---

## 📋 Step 2: Verify Backend Health

### Test Backend Health Endpoint
```bash
curl http://localhost:3001/api/health
```

### Expected Response
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### Alternative: Browser
Open: `http://localhost:3001/api/health`

---

## 📋 Step 3: Verify Frontend Configuration

### Frontend API URL
**File:** `src/services/api.js`

**Configuration:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
```

✅ **This is correct!** Frontend is configured to connect to `http://localhost:3001/api`

### Environment Variables (Optional)
If you want to use a custom API URL:

**File:** `.env` (in root directory)
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 📋 Step 4: Start Frontend

```bash
# Make sure backend is running first!
cd /Users/rajgupta/my-react-app
npm run dev
```

### Expected Output
```
  VITE v4.x.x  build xxxxxxx
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 📋 Step 5: Test Login

### With Console Open (Recommended)
1. Open browser: `http://localhost:5173`
2. Open DevTools: `F12` → Console tab
3. Enter test credentials:
   - Email: `test@example.com`
   - Password: `Test@123`
4. Click "Sign in"
5. Watch console for logs

### Expected Console Output

#### Success Flow:
```
🔌 API Configuration:
   Base URL: http://localhost:3001/api
   Environment: development
   Vite API URL: undefined

📤 [API REQUEST] POST http://localhost:3001/api/auth/login
   Full URL: http://localhost:3001/api/auth/login
   Payload: {email: "test@example.com", password: "Test@123"}
   Token: No

📥 [API RESPONSE] 200 OK
   Data: {
     message: "Login successful",
     success: true,
     token: "eyJhbGciOiJIUzI1NiIs...",
     user: {
       _id: "...",
       name: "Test User",
       email: "test@example.com",
       role: "student",
       ...
     }
   }

🔐 [AUTH SERVICE] Login attempt:
   Email: test@example.com
   Backend URL: http://localhost:3001/api

✅ [AUTH SERVICE] Login successful!

💾 [AUTH SERVICE] Stored in localStorage:
   Token: Yes
   User: test@example.com (student)
```

#### Error Flow (Network Error):
```
❌ [API ERROR] Network/Server Error
   Type: Network Error (ERR_NETWORK)
   Message: Cannot reach backend server
   Backend URL: http://localhost:3001/api
   💡 SOLUTION:
      1. Check if backend is running: npm start (in /backend)
      2. Verify port: 3001
      3. Check CORS is enabled on backend
```

---

## 🔍 Troubleshooting

### Issue 1: "Network Error" or "ERR_CONNECTION_REFUSED"

**Cause:** Backend is not running

**Solution:**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
npm run dev
```

**Verify:**
- Backend output shows: `🚀 SERVER RUNNING on http://localhost:3001`
- Frontend can access: `http://localhost:3001/api/health`

---

### Issue 2: "Cannot reach backend server"

**Cause:** Firewall or network configuration

**Solution:**
```bash
# Check if port 3001 is listening
lsof -i :3001

# If nothing shows, restart backend
npm start
```

---

### Issue 3: CORS Error

**Cause:** CORS not properly configured on backend

**Solution:**
Backend `server.js` already has CORS enabled:
```javascript
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
}));
```

**Verify:** Check backend console for CORS configuration message

---

### Issue 4: "Invalid email or password"

**Cause:** User doesn't exist in database

**Solution:**

Option A - Register new user:
```
1. Go to: http://localhost:5173/signup
2. Fill form with:
   - Name: Test User
   - Email: test@example.com
   - Password: Test@123
   - Role: student
3. Click "Create an account"
```

Option B - Create via API:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123",
    "role": "student"
  }'
```

---

## 📊 Backend Configuration Summary

### Port
```javascript
const PORT = process.env.PORT || 3001;
```
- Default: **3001**
- Can be changed in `.env` file: `PORT=5000`

### Database
```javascript
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/...")
```
- Using MongoDB Atlas (cloud database)
- Fallback to mock database if offline

### CORS
```javascript
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", ...],
  credentials: true,
}));
```
- Allows requests from frontend on ports 5173 and 5174
- Add more origins in `.env` if needed

### API Routes
```
GET  /api/health              (Health check)
POST /api/auth/login          (Login)
POST /api/auth/register       (Registration)
GET  /api/auth/verify-token   (Token verification)
```

---

## 📊 Frontend Configuration Summary

### API Base URL
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
```
- Backend URL: `http://localhost:3001/api`
- Can be overridden with `VITE_API_URL` in `.env`

### Error Handling
```javascript
// Automatic error handling with helpful messages
// - Network errors: Shows backend URL and solution
// - Server errors: Shows specific error from backend
// - Timeout: Shows request timeout message
```

### Logging
```javascript
// Request logging
console.log(`📤 [API REQUEST] ${method} ${url}`);

// Response logging
console.log(`📥 [API RESPONSE] ${status} ${statusText}`);

// Error logging with debugging info
console.error("❌ [API ERROR] Type: Network/Server/Timeout");
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 3001
- [ ] Health check responds: `http://localhost:3001/api/health`
- [ ] Frontend running on port 5173
- [ ] API URL configured: `http://localhost:3001/api`
- [ ] CORS enabled on backend
- [ ] Test user exists or can register
- [ ] Browser console shows proper logs
- [ ] Login successful with redirect to dashboard

---

## 🚀 Full Startup Procedure

### Terminal 1: Backend
```bash
cd /Users/rajgupta/my-react-app/backend
npm start
```

Wait for:
```
🚀 SERVER RUNNING on http://localhost:3001
✅ MongoDB connected (or ⚠️  Using Mock Database)
```

### Terminal 2: Frontend
```bash
cd /Users/rajgupta/my-react-app
npm run dev
```

Wait for:
```
VITE v4.x.x  build xxxxxxx
➜  Local:   http://localhost:5173/
```

### Browser
1. Open: `http://localhost:5173/login`
2. Open DevTools: `F12` → Console
3. Test login with credentials
4. Watch console for detailed logs

---

## 📚 File Changes Made

### Enhanced Files:
1. **`src/services/api.js`**
   - Added comprehensive request/response logging
   - Better error detection and debugging messages
   - Network error handling with solutions

2. **`src/services/auth.js`**
   - Enhanced error messages for network issues
   - Better error categorization
   - Helpful logging for debugging

3. **`backend/server.js`**
   - Improved startup logging
   - Clear API endpoint display
   - Database status indication
   - Graceful shutdown handling

4. **`backend/routes/auth.js`**
   - Better login request logging
   - Detailed success/failure logs
   - Timestamp and validation logs

---

## 🔗 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React app |
| Backend | http://localhost:3001 | Express server |
| API Base | http://localhost:3001/api | API endpoints |
| Health | http://localhost:3001/api/health | Server status |

---

## 📞 Quick Help

**Backend not starting?**
```bash
npm install
npm start
```

**Can't connect to backend?**
```bash
# Check if port 3001 is listening
curl http://localhost:3001/api/health

# Check if process is running
lsof -i :3001
```

**Login not working?**
1. Check browser console (F12)
2. Check backend terminal for logs
3. Verify test user exists
4. Check API URL is correct

**Need to reset database?**
```bash
# Delete MongoDB connection
# Then restart backend
# It will use mock database
```

---

## ✨ Summary

✅ **Backend configured** - Listening on port 3001  
✅ **Frontend configured** - Connects to http://localhost:3001/api  
✅ **CORS enabled** - Frontend can make requests  
✅ **Logging added** - Console shows all requests/responses  
✅ **Error handling improved** - Clear error messages  
✅ **Health checks** - Can verify server is running  

**You're all set! Start both servers and test the login.**
