# Admin Dashboard Button Navigation Fix - Complete Implementation

## Summary
Fixed "View Profile" and "View Details" buttons in the admin dashboard. They now navigate to detailed pages and fetch specific data from Firestore.

---

## Files Updated/Created

### 1. **StudentTable.jsx** (Updated)
**Location**: `src/components/admin/StudentTable.jsx`

**Changes**:
- Added `import { useNavigate } from "react-router-dom"`
- Added `const navigate = useNavigate()` in component
- **"View Profile" button** → `onClick={() => navigate(`/admin/student/${student.id}`)}`
- **"View Assessment" button** → `onClick={() => navigate(`/admin/assessment/${student.latestAssessment.id}`)}`

```jsx
// Example button usage:
<button 
  onClick={() => navigate(`/admin/student/${student.id}`)}
  className="text-blue-600 hover:text-blue-900 font-medium"
>
  View Profile
</button>
```

---

### 2. **AssessmentTable.jsx** (Updated)
**Location**: `src/components/admin/AssessmentTable.jsx`

**Changes**:
- Added `import { useNavigate } from "react-router-dom"`
- Added `const navigate = useNavigate()` in component
- **"View Details" button** → `onClick={() => navigate(`/admin/assessment/${assessment.id}`)}`

```jsx
// Example button usage:
<button 
  onClick={() => navigate(`/admin/assessment/${assessment.id}`)}
  className="text-blue-600 hover:text-blue-900 font-medium"
>
  View Details
</button>
```

---

### 3. **StudentProfile.jsx** (New)
**Location**: `src/pages/admin/StudentProfile.jsx`

**Features**:
- Fetches student from Firestore by ID using `getDoc(doc(db, "users", id))`
- Displays:
  - Student name, email, role
  - Risk level and score
  - Last active date
  - Full profile data
  - Complete Firestore record (JSON)
- Loading and error states
- Back button to navigate back

**Key Code**:
```jsx
const { id } = useParams();
const [student, setStudent] = useState(null);

useEffect(() => {
  const fetchStudent = async () => {
    const docSnap = await getDoc(doc(db, "users", id));
    if (docSnap.exists()) {
      setStudent({ id: docSnap.id, ...docSnap.data() });
    }
  };
  fetchStudent();
}, [id]);
```

---

### 4. **AssessmentDetails.jsx** (New)
**Location**: `src/pages/admin/AssessmentDetails.jsx`

**Features**:
- Fetches assessment from Firestore by ID using `getDoc(doc(db, "assessments", id))`
- Displays:
  - Student name and email
  - Risk level badge (high/moderate/low)
  - Overall score with color coding
  - Primary concern and assessment date
  - Stress breakdown by category
  - Individual question responses
  - Complete Firestore record (JSON)
- Loading and error states
- Back button to navigate back

**Key Code**:
```jsx
const { id } = useParams();
const [assessment, setAssessment] = useState(null);

useEffect(() => {
  const fetchAssessment = async () => {
    const docSnap = await getDoc(doc(db, "assessments", id));
    if (docSnap.exists()) {
      setAssessment({ id: docSnap.id, ...docSnap.data() });
    }
  };
  fetchAssessment();
}, [id]);
```

---

### 5. **App.jsx** (Updated)
**Location**: `src/App.jsx`

**Imports Added**:
```jsx
const StudentProfile = lazy(() => import("./pages/admin/StudentProfile"));
const AssessmentDetails = lazy(() => import("./pages/admin/AssessmentDetails"));
```

**Routes Added**:
```jsx
<Route path="/admin/student/:id" element={<RoleRoute allow={["admin"]}><AdminLayout><StudentProfile /></AdminLayout></RoleRoute>} />
<Route path="/admin/assessment/:id" element={<RoleRoute allow={["admin"]}><AdminLayout><AssessmentDetails /></AdminLayout></RoleRoute>} />
```

---

## How It Works

### User Flow:
1. Admin views Students page or Assessments page
2. Clicks "View Profile" (student) or "View Details" (assessment)
3. Navigates to detail page with ID in URL (e.g., `/admin/student/userId123`)
4. Page fetches specific data from Firestore
5. Displays detailed information
6. Admin can click "Back" to return

### Data Flow:
```
StudentTable/AssessmentTable (onClick handler)
    ↓
useNavigate(/admin/student/:id or /admin/assessment/:id)
    ↓
StudentProfile/AssessmentDetails (useParams to get ID)
    ↓
getDoc(doc(db, collection, id)) from Firestore
    ↓
Display data with loading/error states
```

---

## Key Technical Details

✅ **Student ID**: Uses `student.id` (Firestore doc ID)
✅ **Assessment ID**: Uses `assessment.id` (Firestore doc ID)
✅ **Route Guards**: `RoleRoute` ensures only admins can view
✅ **Layout**: Keeps `AdminLayout` wrapper for consistent sidebar
✅ **Error Handling**: Shows user-friendly error messages
✅ **Loading States**: Displays loading messages during fetch
✅ **Back Navigation**: `useNavigate(-1)` to go back

---

## Testing Checklist

- [ ] Click "View Profile" button on Students page
- [ ] StudentProfile page loads with correct student data
- [ ] Click "View Assessment" button on Students page
- [ ] AssessmentDetails page loads with correct assessment data
- [ ] Click "View Details" button on Assessments page
- [ ] AssessmentDetails page loads with assessment data
- [ ] Back button works on both detail pages
- [ ] Error handling shows if ID doesn't exist
- [ ] Loading state appears briefly while fetching

---

## No Changes To:
- UI/Design (same buttons, same layout)
- Routing structure (admin dashboard routes unchanged)
- Other admin pages (Analytics, Settings, etc.)
- StudentTable and AssessmentTable structure (only added onClick)
