import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";
import { handleGoogleRedirectResult, createUserIfNotExists } from "./services/auth.js";
import { updateUserStreak } from "./services/firebase/users.js";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Assessment = lazy(() => import("./pages/Assessment"));
const Progress = lazy(() => import("./pages/Progress"));
const ProgressAndRewards = lazy(() => import("./pages/ProgressAndRewards"));
const Messages = lazy(() => import("./pages/Messages"));
const Profile = lazy(() => import("./pages/Profile"));
const CounsellorDashboard = lazy(() => import("./pages/CounsellorDashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AnalyticsPage = lazy(() => import("./pages/admin/AnalyticsPage"));
const StudentsPage = lazy(() => import("./pages/admin/StudentsPage"));
const AssessmentsPage = lazy(() => import("./pages/admin/AssessmentsPage"));
const StudentProfile = lazy(() => import("./pages/admin/StudentProfile"));
const AssessmentDetails = lazy(() => import("./pages/admin/AssessmentDetails"));

import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import RoleRoute from "./components/RoleRoute";
import DashboardRedirect from "./components/DashboardRedirect";

function App() {
  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};

    const initAuth = async () => {
      await handleGoogleRedirectResult();

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!mounted || !firebaseUser) return;

        try {
          await createUserIfNotExists(firebaseUser);
          const streakState = await updateUserStreak(firebaseUser.uid);
          const storedUser = JSON.parse(localStorage.getItem("user") || "null") || {};

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...storedUser,
              _id: firebaseUser.uid,
              id: firebaseUser.uid,
              name: storedUser.name || firebaseUser.displayName || "User",
              email: storedUser.email || firebaseUser.email || "",
              role: storedUser.role || "student",
              profileImage: storedUser.profileImage || firebaseUser.photoURL || "",
              streak: streakState.streak,
              lastActiveDate: streakState.lastActiveDate,
            })
          );
          localStorage.setItem("auth_token", firebaseUser.uid);
        } catch (error) {
          console.error("[App] Failed to sync auth state:", error);
        }
      });
    };

    initAuth();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600">Loading page...</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/dashboard/student" element={<RoleRoute allow={["student"]}><Layout><Dashboard /></Layout></RoleRoute>} />
          <Route path="/attendance" element={<RoleRoute allow={["student"]}><Layout><Attendance /></Layout></RoleRoute>} />
          <Route path="/assessment" element={<RoleRoute allow={["student"]}><Layout><Assessment /></Layout></RoleRoute>} />
          <Route path="/progress" element={<RoleRoute allow={["student"]}><Layout><Progress /></Layout></RoleRoute>} />
          <Route path="/progress-and-rewards" element={<RoleRoute allow={["student"]}><Layout><ProgressAndRewards /></Layout></RoleRoute>} />
          <Route path="/messages" element={<RoleRoute allow={["student", "counsellor"]}><Layout><Messages /></Layout></RoleRoute>} />
          <Route path="/profile" element={<RoleRoute allow={["student", "counsellor", "admin"]}><Layout><Profile /></Layout></RoleRoute>} />
          <Route path="/dashboard/counsellor" element={<RoleRoute allow={["counsellor"]}><Layout><CounsellorDashboard /></Layout></RoleRoute>} />
          <Route path="/dashboard/admin" element={<RoleRoute allow={["admin"]}><AdminLayout><AdminDashboard /></AdminLayout></RoleRoute>} />
          <Route path="/dashboard/admin/students" element={<RoleRoute allow={["admin"]}><AdminLayout><StudentsPage /></AdminLayout></RoleRoute>} />
          <Route path="/dashboard/admin/assessments" element={<RoleRoute allow={["admin"]}><AdminLayout><AssessmentsPage /></AdminLayout></RoleRoute>} />
          <Route path="/dashboard/admin/analytics" element={<RoleRoute allow={["admin"]}><AdminLayout><AnalyticsPage /></AdminLayout></RoleRoute>} />
          <Route path="/dashboard/admin/settings" element={<RoleRoute allow={["admin"]}><AdminLayout><AdminDashboard /></AdminLayout></RoleRoute>} />
          <Route path="/admin/student/:id" element={<RoleRoute allow={["admin"]}><AdminLayout><StudentProfile /></AdminLayout></RoleRoute>} />
          <Route path="/admin/assessment/:id" element={<RoleRoute allow={["admin"]}><AdminLayout><AssessmentDetails /></AdminLayout></RoleRoute>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
