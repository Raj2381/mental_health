# 🧪 MongoDB Fix - Exact Test Commands

## Quick Test (Copy & Paste)

### Terminal 1: Start Backend
```bash
cd /Users/rajgupta/my-react-app/backend
npm start
```

**Wait for:**
```
✅ MONGODB CONNECTED SUCCESSFULLY
Database: Using Real MongoDB
🚀 SERVER RUNNING on http://localhost:3001
```

---

### Terminal 2: Test Registration

#### Test 1: Register Valid User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "Alice@123",
    "role": "student"
  }'
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "student"
  }
}
```

**Backend Console Should Show:**
```
📥 [REGISTER] Request received:
   Using MongoDB: ✅
   Name: Alice Smith
   Email: alice@example.com
   Role: student

🔍 [REGISTER] Checking if email exists in MongoDB...
👤 [REGISTER] Creating new user...
💾 [REGISTER] Saving user to MongoDB...
✅ [REGISTER] User saved successfully to MongoDB! ID: 507f1f77bcf86cd799439011
✨ [REGISTER] SUCCESS! User: alice@example.com Role: student
```

---

#### Test 2: Register with Duplicate Email
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith 2",
    "email": "alice@example.com",
    "password": "Alice@123",
    "role": "student"
  }'
```

**Expected Response (409):**
```json
{
  "error": "Email already registered",
  "errors": {
    "email": "This email is already in use. Please login or try another email."
  }
}
```

**Backend Console Should Show:**
```
⚠️  [REGISTER] Email already exists: alice@example.com
```

---

#### Test 3: Register with Validation Errors
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "email": "invalid",
    "password": "12345",
    "role": "invalid"
  }'
```

**Expected Response (400):**
```json
{
  "error": "Validation failed",
  "errors": {
    "name": "Name must be at least 2 characters",
    "email": "Invalid email format",
    "password": "Password must be at least 6 characters",
    "role": "Invalid role selected"
  }
}
```

---

### Terminal 2: Test Login

#### Test 1: Login with Valid Credentials
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "Alice@123"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "role": "student"
  }
}
```

**Backend Console Should Show:**
```
════════════════════════════════════════════════════════════
🔐 [LOGIN] New login request
════════════════════════════════════════════════════════════
   Using MongoDB: ✅
   Email: alice@example.com

🔍 [LOGIN] Looking up user in MongoDB...
✅ [LOGIN] User found in MongoDB: Alice Smith
🔐 [LOGIN] Verifying password...
✅ [LOGIN] Password valid
🔐 [LOGIN] Generating JWT token...
✨ [LOGIN] SUCCESS!
   User: alice@example.com
   Role: student
   ID: 507f1f77bcf86cd799439011
════════════════════════════════════════════════════════════
```

---

#### Test 2: Login with Wrong Password
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "WrongPassword"
  }'
```

**Expected Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

**Backend Console Should Show:**
```
❌ [LOGIN] Invalid password
```

---

#### Test 3: Login with Non-existent Email
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "Test@123"
  }'
```

**Expected Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

**Backend Console Should Show:**
```
❌ [LOGIN] User not found: nonexistent@example.com
```

---

### Test 3: Verify Data Persistence

#### Step 1: Stop Backend
```bash
# In Terminal 1 (where backend is running):
# Press Ctrl+C
```

#### Step 2: Verify Data is in MongoDB
Use MongoDB Atlas UI to check:
1. Go to https://cloud.mongodb.com
2. Navigate to Cluster0
3. Click "Browse Collections"
4. Select "student_wellness" database
5. Select "users" collection
6. You should see alice@example.com user
7. Password should be hashed (starts with $2a$)

#### Step 3: Restart Backend
```bash
npm start
```

**Should see:** MongoDB connects again

#### Step 4: Login Again
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "Alice@123"
  }'
```

**Expected:** Same successful response as before!  
**Proof:** Data persisted across restart ✅

---

### Test 4: Health Check

```bash
curl http://localhost:3001/api/health
```

**Expected Response (200):**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## 🧪 Automated Test Script

Save as `test-mongodb.sh`:

```bash
#!/bin/bash

echo "🧪 MongoDB Fix Testing Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "1️⃣  Checking if backend is running..."
if ! curl -s http://localhost:3001/api/health > /dev/null; then
  echo -e "${RED}❌ Backend not running on port 3001${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Backend is running${NC}"

# Test 1: Register User
echo ""
echo "2️⃣  Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "password": "Test@123",
    "role": "student"
  }')

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Registration successful${NC}"
  # Extract email from response
  TEST_EMAIL=$(echo "$REGISTER_RESPONSE" | grep -o '"email":"[^"]*"' | head -1 | cut -d'"' -f4)
else
  echo -e "${RED}❌ Registration failed${NC}"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

# Test 2: Login with Valid Credentials
echo ""
echo "3️⃣  Testing login with valid credentials..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"Test@123\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Login successful${NC}"
else
  echo -e "${RED}❌ Login failed${NC}"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

# Test 3: Login with Invalid Password
echo ""
echo "4️⃣  Testing login with invalid password..."
INVALID_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"WrongPassword\"
  }")

if echo "$INVALID_RESPONSE" | grep -q '"error"'; then
  echo -e "${GREEN}✅ Invalid login correctly rejected${NC}"
else
  echo -e "${RED}❌ Invalid login should have been rejected${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"
echo "================================"
echo "🎉 MongoDB is working correctly!"
```

Run with:
```bash
chmod +x test-mongodb.sh
./test-mongodb.sh
```

---

## ✅ Checklist

Run these tests in order:

- [ ] Backend starts with "✅ MONGODB CONNECTED SUCCESSFULLY"
- [ ] Startup shows "Database: ✅ Using Real MongoDB"
- [ ] Test 1: Register user → 201 response + token
- [ ] Backend console shows "Using MongoDB: ✅"
- [ ] Backend console shows "User saved successfully to MongoDB!"
- [ ] Test 2: Register duplicate email → 409 error
- [ ] Test 3: Register invalid data → 400 error
- [ ] Test 4: Login valid user → 200 response + token
- [ ] Backend console shows "Looking up user in MongoDB..."
- [ ] Backend console shows "User found in MongoDB"
- [ ] Test 5: Login wrong password → 401 error
- [ ] Test 6: Login non-existent email → 401 error
- [ ] Test 7: Health check → 200 response
- [ ] Test 8: Data persistence
  - [ ] Stop backend
  - [ ] Check MongoDB has user document
  - [ ] Start backend again
  - [ ] Login still works
  - [ ] Data persisted ✅

**If all tests pass:** ✅ **MONGODB MIGRATION COMPLETE**

---

## 🎯 Expected Outcomes

✅ No mock database logs  
✅ Only "Using MongoDB: ✅" appears  
✅ All user data saved to MongoDB  
✅ Data persists across restart  
✅ Clear error messages  
✅ Production-ready backend  

---

**Ready to test!** 🚀
