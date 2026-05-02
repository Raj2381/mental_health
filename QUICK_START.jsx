/* eslint-disable react-refresh/only-export-components */
/**
 * QUICK START - Copy & Paste into Dashboard.jsx
 * 
 * This is a working example that you can paste directly into your Dashboard.jsx
 * to see all the new features working immediately.
 */

// ============================================
// 1. ADD THESE IMPORTS AT THE TOP
// ============================================
import RiskScoreCard from "../components/RiskScoreCard";
import CounselorCard from "../components/CounselorCard";
import RewardsPanel from "../components/RewardsPanel";
import AttendanceCard from "../components/AttendanceCard";

// ============================================
// 2. SAMPLE DATA - Replace with real Firebase data
// ============================================
const SAMPLE_STUDENT_DATA = {
  // Authentication
  id: "user123",
  email: "student@example.com",
  role: "student",
  fullName: "Alex Johnson",

  // Academic
  gpa: 3.5,
  assignmentsDue: 2,
  upcomingExams: true,
  examDate: "2026-04-15",

  // Health & Wellness
  currentMentalState: "Sometimes stressed",
  onMedication: false,
  sleepHours: 6.8,
  sleepQuality: "Fair",
  morningRoutineRegular: true,

  // Attendance
  attendance: 82,
  classesAttended: 49,
  totalClasses: 60,

  // Reward System
  points: 280,
  streak: 7,
  achievements: ["7day-streak", "perfect-week", "attendance-hero"],
  level: "Consistent",

  // Preferences
  preferredLanguage: "English",
  preferredAvailability: "evening",

  // Wellness Metrics
  riskScore: 42,
  previousScore: 48,
  daysLowStress: 8,
  weeklyAchievementScore: 95,
  socialConnection: "Limited",
  inTherapy: false,
  needsCareerGuidance: true
};

// ============================================
// 3. ENHANCED DASHBOARD COMPONENT
// ============================================
export function DashboardEnhanced() {
  const [studentData] = useState(SAMPLE_STUDENT_DATA);
  // In production, fetch this with:
  // useEffect(() => {
  //   const unsubscribe = onSnapshot(doc(db, "users", userId), (doc) => {
  //     setStudentData(doc.data());
  //   });
  //   return () => unsubscribe();
  // }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      {/* Header */}
      <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {studentData.fullName} 👋
        </h1>
        <p className="text-white/80">Let's check in on your wellness journey</p>
      </Motion.div>

      {/* Main Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ===== SECTION 1: RISK SCORE (2 cols) ===== */}
        <RiskScoreCard studentData={studentData} />

        {/* ===== SECTION 2: SIDEBAR ===== */}
        <div className="space-y-6">
          {/* Attendance */}
          <AttendanceCard
            attended={studentData.classesAttended}
            total={studentData.totalClasses}
            target={75}
          />

          {/* Quick Actions */}
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:from-blue-600 hover:to-cyan-600 transition-all">
                📋 Daily Check-in
              </button>
              <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all">
                📅 View Timetable
              </button>
              <button className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-600 hover:to-emerald-600 transition-all">
                📝 Assessment
              </button>
            </div>
          </div>
        </div>

        {/* ===== SECTION 3: COUNSELOR RECOMMENDATIONS ===== */}
        <CounselorCard studentData={studentData} />

        {/* ===== SECTION 4: REWARDS PANEL ===== */}
        <RewardsPanel studentData={studentData} />

        {/* ===== SECTION 5: MENTAL HEALTH INSIGHTS ===== */}
        <div className="col-span-full p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">🧠 Mental Health Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-white/70 text-sm mb-2">Stress Level</p>
              <p className="text-2xl font-bold text-white">Moderate 🟡</p>
              <p className="text-xs text-white/60 mt-2">Trending improving</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-white/70 text-sm mb-2">Sleep Quality</p>
              <p className="text-2xl font-bold text-white">Fair 😴</p>
              <p className="text-xs text-white/60 mt-2">6.8 hours average</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-white/70 text-sm mb-2">Social Connection</p>
              <p className="text-2xl font-bold text-white">Limited 🤝</p>
              <p className="text-xs text-white/60 mt-2">Consider reaching out</p>
            </div>
          </div>
        </div>

        {/* ===== SECTION 6: EXISTING COMPONENTS ===== */}
        {/* Add your existing NotificationPanel and RealTimeChat here */}
        <div className="col-span-full">
          <p className="text-white/70 text-center py-8">
            Add your existing NotificationPanel and RealTimeChat components here
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. MOCK STUDENT DATA - Use this if Firebase isn't ready
// ============================================
export function generateMockStudentData() {
  return {
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    email: `student${Math.floor(Math.random() * 1000)}@university.edu`,
    role: "student",
    fullName: ["Alex", "Jordan", "Sam", "Casey"][Math.floor(Math.random() * 4)],
    
    // Random academic data
    gpa: (2.5 + Math.random() * 1.5).toFixed(2),
    assignmentsDue: Math.floor(Math.random() * 5),
    upcomingExams: Math.random() > 0.5,
    
    // Random health data
    currentMentalState: ["Doing well", "Sometimes stressed", "Struggling"][
      Math.floor(Math.random() * 3)
    ],
    sleepHours: (5.5 + Math.random() * 3).toFixed(1),
    sleepQuality: ["Poor", "Fair", "Good"][Math.floor(Math.random() * 3)],
    onMedication: Math.random() > 0.7,
    
    // Random attendance
    classesAttended: Math.floor(Math.random() * 60),
    totalClasses: 60,
    attendance: Math.floor(Math.random() * 100),
    
    // Random rewards
    points: Math.floor(Math.random() * 1000),
    streak: Math.floor(Math.random() * 30),
    achievements: ["7day-streak", "perfect-week", "attendance-hero"].slice(
      0,
      Math.floor(Math.random() * 3)
    ),
    
    // Random wellness metrics
    riskScore: Math.floor(Math.random() * 100),
    previousScore: Math.floor(Math.random() * 100),
    socialConnection: ["Isolated", "Limited", "Moderate", "Strong"][
      Math.floor(Math.random() * 4)
    ],
    preferredLanguage: "English",
    preferredAvailability: ["morning", "afternoon", "evening"][
      Math.floor(Math.random() * 3)
    ]
  };
}

// ============================================
// 5. USE IN YOUR COMPONENT
// ============================================
// 
// const [studentData, setStudentData] = useState(generateMockStudentData());
// 
// Or with real Firebase:
//
// useEffect(() => {
//   const unsubscribe = onSnapshot(
//     doc(db, "users", userId),
//     (doc) => {
//       if (doc.exists()) {
//         setStudentData(doc.data());
//       }
//     }
//   );
//   return () => unsubscribe();
// }, [userId]);

// ============================================
// 6. DON'T FORGET IMPORTS
// ============================================
import { useState } from "react";
import { motion as Motion } from "framer-motion";
// import { onSnapshot, doc } from "firebase/firestore";
// import { db } from "../firebase";
