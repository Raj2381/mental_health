# MongoDB Connection Configuration Guide

## Current Status

✅ **Backend is running on localhost:3001**
✅ **Signup/Login system is working with MockUser (in-memory database)**
❌ **MongoDB Atlas connection needs correct cluster name**

---

## Issue Encountered

When you provided the credentials:
- Username: `Raj`
- Password: `Rajg270106@`

The system attempted to connect to: `mongodb+srv://Raj:Rajg270106%40@cluster0.mongodb.net`

**Error**: `querySrv ENOTFOUND _mongodb._tcp.cluster0.mongodb.net`

**Meaning**: The MongoDB cluster named `cluster0` does not exist in your MongoDB Atlas account.

---

## How to Get Your Correct Connection String

### Step 1: Go to MongoDB Atlas
1. Open https://cloud.mongodb.com
2. Sign in with your account
3. Select your project
4. Click "Connect"

### Step 2: Get Connection String
1. Select "Drivers" (or "Connect with MongoDB Compass" if using that)
2. Select your Node.js driver version
3. Click "Copy" to copy the connection string

### Step 3: It Should Look Like:
```
mongodb+srv://Raj:PASSWORD@yourclustername.mongodb.net/student_wellness?retryWrites=true&w=majority
```

### Key Differences to Check:
- **Cluster name**: Could be `cluster0`, `myapp`, `main`, etc. - whatever you named it
- **Database name**: Could be different from `student_wellness`
- **Your password**: Must have special characters URL-encoded (@ becomes %40)

---

## How to Update Connection String

### Option 1: Update .env file
Edit `/Users/rajgupta/my-react-app/backend/.env`:

```env
MONGODB_URI=mongodb+srv://Raj:Rajg270106%40@YOUR_CLUSTER_NAME.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

Replace:
- `YOUR_CLUSTER_NAME` - with your actual cluster name
- `DATABASE_NAME` - with your database name
- `Rajg270106%40` - password with @ encoded as %40

### Option 2: Test Connection First
Before updating, you can test if the connection string works:

```bash
# In terminal:
mongodb+srv://Raj:Rajg270106%40@YOUR_CLUSTER_NAME.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

---

## Verify MongoDB Connection

After updating the connection string:

1. **Restart backend**:
```bash
cd /Users/rajgupta/my-react-app/backend
pkill -f "node.*server.js" || true
node server.js
```

2. **Watch for success message**:
```
✅ MongoDB connected
```

If you see this instead:
```
❌ MongoDB connection error: ...
⚠️  Using in-memory mock database for testing...
```

Then the connection string still isn't correct.

---

## Current Working Setup

### ✅ What's Working Now:
- Backend server running on port 3001
- Signup/Login system fully functional
- Using MockUser (in-memory database) as fallback
- All validations working
- JWT authentication working
- Error handling working

### Example Test:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Your Name","email":"you@example.com","password":"pass123","role":"student"}'
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": { ... }
}
```

---

## Next Steps

1. **Get your MongoDB connection string** from MongoDB Atlas dashboard
2. **Update .env** with the correct connection string
3. **Restart backend** to apply changes
4. **Watch logs** for "✅ MongoDB connected" message
5. **System will use real MongoDB** instead of MockUser

---

## If You Don't Have MongoDB Atlas Yet

If you haven't created a MongoDB cluster yet:

1. Go to https://cloud.mongodb.com
2. Sign up or log in
3. Create a new project
4. Create a cluster (free tier available)
5. Create a database user with your credentials
6. Get the connection string
7. Update .env with the connection string

---

## Temporary Solution

**For now, the system works perfectly with MockUser**:
- Data is stored in memory
- All features work
- Perfect for testing and development
- When you provide MongoDB credentials later, simply restart and data will persist in MongoDB

---

## Summary

| What | Status | Details |
|------|--------|---------|
| Backend Server | ✅ Running | localhost:3001 |
| Signup/Login | ✅ Working | With validation |
| MockUser Database | ✅ Working | In-memory fallback |
| MongoDB Atlas | ❌ Not Connected | Need correct cluster name |
| Encryption | ✅ bcryptjs | Password hashing working |
| JWT Tokens | ✅ Working | 7-day expiry |

---

**Action Required**: Provide your MongoDB cluster name or full connection string from your MongoDB Atlas dashboard.
