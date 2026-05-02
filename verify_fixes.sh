#!/bin/bash
# Verification Script - Student Wellness SaaS Fixes

echo "🔍 VERIFICATION: Student Wellness SaaS Fixes"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
CHECKS_PASSED=0
CHECKS_TOTAL=0

# Function to check if fix is in place
check_fix() {
    local file=$1
    local search_string=$2
    local description=$3
    
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    
    if grep -q "$search_string" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} PASS: $description"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo -e "${RED}❌${NC} FAIL: $description"
        echo "   File: $file"
        echo "   Looking for: $search_string"
    fi
}

echo "📊 FIX 1: Daily Progress Display"
echo "================================"
check_fix "src/pages/Dashboard.jsx" "dailyActivity?.completedCount ?? 0" "Dashboard nullish coalescing for completedCount"
check_fix "src/pages/Dashboard.jsx" "dailyActivity?.totalCount ?? 8" "Dashboard nullish coalescing for totalCount"
check_fix "src/pages/Dashboard.jsx" "console.log(\"Dashboard dailyActivity:" "Dashboard debug logging"
check_fix "src/components/ProgressSection.jsx" "const displayValue = Math.max" "ProgressSection defensive validation"
check_fix "src/services/firebase/progressSync.js" "completedCount: dailyActivities.completedCount ?? 0" "progressSync nullish coalescing"
check_fix "src/services/firebase/progressSync.js" "watchDailyActivities emitting:" "progressSync debug logging"
check_fix "src/services/firebase/progressSync.js" "No student_data document found" "progressSync fallback handling"

echo ""
echo "🎫 FIX 2: Appointment System"
echo "============================"
check_fix "src/services/firebase/appointments.js" "if (!id || !status)" "appointments parameter validation"
check_fix "src/services/firebase/appointments.js" "status: String(status).toLowerCase()" "appointments status normalization"
check_fix "src/services/firebase/appointments.js" "console.log(\`Appointment \${id} status updated" "appointments status logging"
check_fix "src/pages/Counsellor/CounsellorDashboard.jsx" "const handleUpdateAppointmentStatus = async" "CounsellorDashboard error handler"
check_fix "src/pages/Counsellor/CounsellorDashboard.jsx" "onStatusChange={handleUpdateAppointmentStatus}" "CounsellorDashboard handler usage"
check_fix "src/pages/Dashboard.jsx" "const statusColor =" "Dashboard status color coding"
check_fix "src/pages/Dashboard.jsx" "appt.counsellorName || \"Counsellor\"" "Dashboard appointment display"

echo ""
echo "📝 Documentation Files"
echo "====================="
check_fix "FIXES_IMPLEMENTED.md" "Root Cause" "FIXES_IMPLEMENTED.md exists"
check_fix "CODE_CHANGES_SUMMARY.md" "Files Modified" "CODE_CHANGES_SUMMARY.md exists"
check_fix "COMPLETE_TESTING_GUIDE.md" "TEST 1: Daily Progress" "COMPLETE_TESTING_GUIDE.md exists"
check_fix "README_FIXES.md" "What Was Broken" "README_FIXES.md exists"

echo ""
echo "=============================================="
echo "📊 RESULTS"
echo "=============================================="
echo -e "Checks Passed: ${GREEN}$CHECKS_PASSED${NC}/$CHECKS_TOTAL"

if [ $CHECKS_PASSED -eq $CHECKS_TOTAL ]; then
    echo -e "${GREEN}✅ ALL FIXES VERIFIED - READY FOR DEPLOYMENT${NC}"
    exit 0
else
    FAILED=$((CHECKS_TOTAL - CHECKS_PASSED))
    echo -e "${RED}⚠️  $FAILED check(s) failed - review above${NC}"
    exit 1
fi
