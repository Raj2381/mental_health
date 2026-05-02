// CENTRALIZED USER PROFILE SYSTEM - INTEGRATION GUIDE

/**
 * ✅ GLOBAL USER PROFILE HOOK
 * 
 * All components should use this hook to access real-time user data:
 */

// Example in Dashboard.jsx or any component:
import { useUserProfile } from "../hooks/useUserProfile";
import { auth } from "../firebase";

function MyComponent() {
  const { userData, loading } = useUserProfile(auth.currentUser?.uid);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{userData?.name}</h1>
      <p>{userData?.email}</p>
      {userData?.profileImage && (
        <img src={userData.profileImage} alt="Profile" />
      )}
    </div>
  );
}

/**
 * ✅ FIRESTORE STRUCTURE (users collection)
 * 
 * {
 *   name: string
 *   email: string
 *   role: "student" | "counsellor" | "admin"
 *   
 *   // Academic Details
 *   rollNumber: string
 *   department: string
 *   semester: string
 *   year: string
 *   college: string
 *   
 *   // Personal Details
 *   phone: string
 *   gender: string
 *   dob: string (YYYY-MM-DD)
 *   
 *   // Profile
 *   profileImage: string (Firebase Storage URL)
 *   bio: string
 *   
 *   // System
 *   profileCompleted: boolean
 *   updatedAt: Timestamp
 * }
 */

/**
 * ✅ PROFILE IMAGE UPLOAD
 * 
 * Firebase Storage path: profile-images/{userId}/{fileName}
 * 
 * Usage in StudentIdentity component:
 * 
 * const { uploadProfileImage } = require("../services/firebase/storage");
 * 
 * const handleImageUpload = async (file) => {
 *   const downloadUrl = await uploadProfileImage(userId, file);
 *   // Use downloadUrl to save in Firestore
 * };
 */

/**
 * ✅ REAL-TIME SYNC ACROSS APP
 * 
 * ALL data updates are automatic because:
 * 1. StudentIdentity saves to "users" collection
 * 2. useUserProfile hook listens with onSnapshot
 * 3. Any component using the hook updates immediately
 * 
 * NO need to manually sync!
 */

/**
 * ✅ WHERE TO USE THE DATA
 * 
 * 1. Dashboard greeting: userData?.name, userData?.profileImage
 * 2. Profile page: All user info from userData
 * 3. Counsellor dashboard: Access student userData
 * 4. Appointment cards: Student name and image
 * 5. Messages: Sender name and avatar
 * 6. Any page needing user info: Just use the hook
 */

/**
 * ✅ DO NOT
 * 
 * ❌ Don't read from multiple collections (no student_data, no separate storage)
 * ❌ Don't duplicate user data
 * ❌ Don't fetch manually - always use the hook
 * ❌ Don't forget to add role field when creating users
 */

export {};
