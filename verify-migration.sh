#!/bin/bash
# Firebase Migration - Testing Commands
# Run these commands in terminal to verify migration

echo "🔍 FIREBASE MIGRATION - VERIFICATION SCRIPT"
echo "=============================================="
echo ""

# Check 1: Verify no Firebase in Dashboard
echo "✓ Check 1: Looking for Firebase in Dashboard.jsx..."
FIREBASE_REFS_DASHBOARD=$(grep -E "firebase|firestore|updateDoc|doc\(db|onSnapshot|auth\.currentUser" src/pages/Dashboard.jsx | wc -l)
if [ "$FIREBASE_REFS_DASHBOARD" -eq 0 ]; then
  echo "  ✅ PASS: No Firebase references found"
else
  echo "  ❌ FAIL: Found $FIREBASE_REFS_DASHBOARD Firebase references"
fi
echo ""

# Check 2: Verify no Firebase in Profile
echo "✓ Check 2: Looking for Firebase in Profile.jsx..."
FIREBASE_REFS_PROFILE=$(grep -E "firebase|firestore|updateDoc|doc\(db|onSnapshot|auth\.currentUser|updatePassword" src/pages/Profile.jsx | wc -l)
if [ "$FIREBASE_REFS_PROFILE" -eq 0 ]; then
  echo "  ✅ PASS: No Firebase references found"
else
  echo "  ❌ FAIL: Found $FIREBASE_REFS_PROFILE Firebase references"
fi
echo ""

# Check 3: Verify REST API calls exist
echo "✓ Check 3: Looking for REST API calls..."
API_CALLS=$(grep -E "fetch.*localhost:3001" src/pages/Dashboard.jsx src/pages/Profile.jsx | wc -l)
if [ "$API_CALLS" -gt 0 ]; then
  echo "  ✅ PASS: Found $API_CALLS REST API calls"
else
  echo "  ❌ FAIL: No REST API calls found"
fi
echo ""

# Check 4: Verify Authorization headers
echo "✓ Check 4: Looking for Authorization headers..."
AUTH_HEADERS=$(grep -E "Authorization.*Bearer" src/pages/Dashboard.jsx src/pages/Profile.jsx | wc -l)
if [ "$AUTH_HEADERS" -gt 0 ]; then
  echo "  ✅ PASS: Found $AUTH_HEADERS Authorization headers"
else
  echo "  ❌ FAIL: No Authorization headers found"
fi
echo ""

# Check 5: Verify error handling
echo "✓ Check 5: Looking for error handling (try-catch)..."
TRY_CATCH=$(grep -E "try \{|catch \(" src/pages/Dashboard.jsx src/pages/Profile.jsx | wc -l)
if [ "$TRY_CATCH" -gt 0 ]; then
  echo "  ✅ PASS: Found $TRY_CATCH try-catch blocks"
else
  echo "  ❌ FAIL: No try-catch blocks found"
fi
echo ""

echo "=============================================="
echo "🧪 MANUAL TESTING REQUIRED"
echo "=============================================="
echo ""
echo "Follow these steps to verify the migration:"
echo ""
echo "1. Start the backend:"
echo "   cd backend && npm start"
echo ""
echo "2. Log in to the frontend"
echo ""
echo "3. Test Dashboard:"
echo "   - Go to Dashboard"
echo "   - Find StudentDetailsCard"
echo "   - Edit rollNumber, department, semester"
echo "   - Click Save"
echo "   - Verify success message appears"
echo "   - Refresh page"
echo "   - Verify changes persisted"
echo ""
echo "4. Test Profile:"
echo "   - Go to Profile page"
echo "   - Edit name, email, phone"
echo "   - Click Save"
echo "   - Verify success message appears"
echo "   - Refresh page"
echo "   - Verify changes persisted"
echo ""
echo "5. Test Password Change:"
echo "   - Scroll to Security section"
echo "   - Enter new password"
echo "   - Confirm password"
echo "   - Click Update"
echo "   - Verify success message"
echo "   - Logout and login with new password"
echo ""
echo "6. Check Browser Console:"
echo "   - Open DevTools (F12)"
echo "   - Go to Console tab"
echo "   - Verify NO Firebase errors"
echo "   - Verify NO auth.currentUser errors"
echo ""

echo "✅ Migration verification complete!"
echo ""
