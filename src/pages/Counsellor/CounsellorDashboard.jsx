import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getCurrentUser } from "../../services/auth.js";
import {
  watchAssignedStudents,
  watchCurrentUser,
  assignUnlinkedStudentsToCounsellor,
} from "../../services/firebase/users.js";
import {
  watchCounsellorAppointments,
  updateAppointmentStatus,
  createAppointment,
} from "../../services/firebase/appointments.js";
import { getOrCreateConversation } from "../../services/firebase/chats";
import Card from "../../components/Card";
import SessionStats from "../../components/Counsellor/SessionStats";
import BarChartBox from "../../components/BarChartBox";
import CounselorCard from "../../components/CounselorCard";
import NotificationPanel from "../../components/NotificationPanel";
import AppointmentCard from "../../components/Counsellor/AppointmentCard";
import StudentDetailModal from "../../components/Counsellor/StudentDetailModal";
import BookSessionModal from "../../components/Counsellor/BookSessionModal";

function getImprovement(stats) {
  if (!Array.isArray(stats) || stats.length < 2) return 0;
  const prev = Number(stats[stats.length - 2]?.riskScore || 0);
  const current = Number(stats[stats.length - 1]?.riskScore || 0);
  return prev - current;
}

function normalizeRiskLevel(score, level) {
  const normalized = String(level || "").toLowerCase();
  if (normalized.includes("high") || score >= 70) return "high";
  if (normalized.includes("moderate") || (score >= 40 && score < 70)) return "moderate";
  return "low";
}

export default function CounsellorDashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [currentCounsellorName, setCurrentCounsellorName] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBookSession, setShowBookSession] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);

  // Get authenticated user
  useEffect(() => {
    const user = getCurrentUser();
    console.log("🔥 USER:", user);
    if (user?.id) {
      console.log("🔥 COUNSELLOR ID:", user.id);
      setUserId(user.id);
      setCurrentCounsellorName(user.name || "Counsellor");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = watchCurrentUser(userId, (data) => {
      console.log("🔥 FIREBASE DATA:", data);
      if (data?.name) {
        setCurrentCounsellorName(data.name);
      }
    });

    return () => unsubscribe?.();
  }, [userId]);

  useEffect(() => {
    if (!userId || isBackfilling) return;

    let cancelled = false;

    (async () => {
      try {
        setIsBackfilling(true);
        const linkedCount = await assignUnlinkedStudentsToCounsellor(userId);
        console.log("🔥 BACKFILL RESULT:", { userId, linkedCount });
        if (!cancelled) {
          // Don't use localStorage - let it run each time to catch new students
        }
      } catch (error) {
        console.error("Failed to backfill assigned students:", error);
      } finally {
        if (!cancelled) setIsBackfilling(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, isBackfilling]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = watchAssignedStudents(userId, (students) => {
      console.log("🔥 STUDENTS:", students);
      setAllStudents(Array.isArray(students) ? students : []);
    });

    return () => unsubscribe?.();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = watchCounsellorAppointments(userId, (appts) => {
      console.log("🔥 FIREBASE DATA:", appts);
      setAppointments(appts || []);
    });

    return () => unsubscribe?.();
  }, [userId]);

  const studentRows = useMemo(
    () =>
      allStudents.map((student) => {
        const latest = student?.latestAssessment || {};
        const categoryScores = latest?.stressBreakdown || latest?.categoryScores || {};
        // Use assessmentScore from watchAssignedStudents, fallback to riskScore, then to 0
        const assessmentScore = Number(student?.assessmentScore || student?.riskScore || 0);
        const assessmentLevel = String(student?.assessmentLevel || student?.riskLevel || "Low");
        const improvement = getImprovement(student?.weeklyStats || []);
        const safeStats = (student?.weeklyStats || []).map((entry) => ({
          date: entry?.date || "",
          riskScore: Number(entry?.riskScore || 0),
          completion: Number(entry?.completion || 0),
        }));

        return {
          ...student,
          id: student.id,
          name: student.name || student?.profile?.name || student.email || `Student ${String(student.id).slice(0, 6)}`,
          email: student.email || student?.profile?.email || "",
          assessmentScore,
          assessmentLevel,
          primaryConcern: latest?.primaryConcern || "general",
          stressBreakdown: {
            academic: Number(categoryScores.academic ?? categoryScores.academicStress ?? 0),
            emotional: Number(categoryScores.emotional ?? categoryScores.emotionalWellbeing ?? 0),
            social: Number(categoryScores.social ?? categoryScores.socialConnection ?? 0),
            sleep: Number(categoryScores.sleep ?? categoryScores.sleepQuality ?? 0),
          },
          dailyProgress: student?.dailyProgress || {
            percent: 0,
            completedTasks: [],
            date: "",
          },
          safeStats,
          improvement,
        };
      }),
    [allStudents]
  );

  const counsellorAppointments = useMemo(
    () => appointments.filter((appointment) => appointment?.counsellorId === userId),
    [appointments, userId]
  );

  const highRisk = useMemo(
    () => studentRows.filter((student) => Number(student.assessmentScore) >= 70),
    [studentRows]
  );
  const moderateRisk = useMemo(
    () =>
      studentRows.filter(
        (student) => Number(student.assessmentScore) >= 40 && Number(student.assessmentScore) < 70
      ),
    [studentRows]
  );
  const lowRisk = useMemo(
    () => studentRows.filter((student) => Number(student.assessmentScore) < 40),
    [studentRows]
  );

  const overview = useMemo(() => {
    const high = highRisk.length;
    const moderate = moderateRisk.length;
    const low = lowRisk.length;

    return {
      totalAll: allStudents.length,
      high,
      moderate,
      low,
    };
  }, [allStudents.length, highRisk.length, lowRisk.length, moderateRisk.length]);

  const filteredStudents = useMemo(() => {
    return studentRows.filter((s) => {
      const score = Number(s.assessmentScore || 0);
      const level = normalizeRiskLevel(score, s.assessmentLevel);
      const displayName = String(s.name || `Student ${String(s.id || "").slice(0, 6)}`).toLowerCase();
      const categoryScores = s.stressBreakdown || s.categoryScores || {};

      const matchesSearch = displayName.includes(search.toLowerCase());
      const matchesRisk =
        riskFilter === "all" ||
        (riskFilter === "high" && (score >= 70 || level === "high")) ||
        (riskFilter === "moderate" && ((score >= 40 && score < 70) || level === "moderate")) ||
        (riskFilter === "low" && (score < 40 || level === "low"));

      const categoryMap = {
        academic: Number(categoryScores.academic || categoryScores.academicStress || 0),
        emotional: Number(categoryScores.emotional || categoryScores.emotionalWellbeing || 0),
        social: Number(categoryScores.social || categoryScores.socialConnection || 0),
        sleep: Number(categoryScores.sleep || categoryScores.sleepQuality || 0),
      };

      const matchesCategory = categoryFilter === "all" || categoryMap[categoryFilter] >= 50;

      return matchesSearch && matchesRisk && matchesCategory;
    });
  }, [studentRows, search, riskFilter, categoryFilter]);

  const riskDistribution = useMemo(
    () => [
      { name: "High", value: overview.high, color: "#ef4444" },
      { name: "Moderate", value: overview.moderate, color: "#f59e0b" },
      { name: "Low", value: overview.low, color: "#22c55e" },
    ],
    [overview]
  );

  const notifications = useMemo(() => {
    const improvementAlerts = studentRows
      .filter((student) => student.improvement !== 0)
      .slice(0, 8)
      .map((student) => ({
        id: `${student.id}-improvement`,
        title: student.name,
        message:
          student.improvement > 0
            ? `Risk decreased by ${student.improvement}. Good progress.`
            : `Risk increased by ${Math.abs(student.improvement)}. Needs attention.`,
        read: false,
      }));

    if (improvementAlerts.length > 0) return improvementAlerts;

    return counsellorAppointments
      .filter((appointment) => appointment.status === "pending")
      .slice(0, 8)
      .map((appointment) => ({
        id: `${appointment.id}-pending`,
        title: appointment.studentName || "Student",
        message: "Session request pending your response.",
        read: false,
      }));
  }, [counsellorAppointments, studentRows]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      console.log(`Appointment ${appointmentId} updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update appointment:", error);
    }
  };

  const handleMessage = async (student) => {
    try {
      if (!student?.id || !userId) return;
      await getOrCreateConversation(student.id, userId);
      navigate("/messages");
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  const handleBookSession = async (bookingData) => {
    try {
      if (!userId) {
        console.error("User not authenticated");
        throw new Error("Please log in to book a session");
      }

      await createAppointment({
        studentId: bookingData.studentId,
        counsellorId: userId,
        studentName: bookingData.studentName,
        counsellorName: currentCounsellorName,
        date: bookingData.date,
        time: bookingData.time,
        mode: "online",
        message: bookingData.topic || "Session booking",
      });

      setShowBookSession(false);
      setShowDetailModal(false);
    } catch (error) {
      console.error("Failed to book session:", error);
      throw error;
    }
  };

  const sessionMetrics = useMemo(() => ({
    total: counsellorAppointments.length,
    pending: counsellorAppointments.filter((appointment) => appointment.status === "pending").length,
    accepted: counsellorAppointments.filter((appointment) => appointment.status === "accepted").length,
    completed: counsellorAppointments.filter((appointment) => appointment.status === "completed").length,
  }), [counsellorAppointments]);

  if (!userId) {
    return <div className="p-10 text-center text-gray-500">Loading user...</div>;
  }

  if (!currentCounsellorName) {
    return <p className="text-gray-400">No data available</p>;
  }

  if (!allStudents || allStudents.length === 0) {
    return <p className="text-gray-400">No assigned students yet</p>;
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 shadow-sm border-b">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[color:var(--text-main)]">Counsellor Dashboard</h1>
            <p className="readable-muted mt-2 text-sm leading-relaxed">Manage assigned students, track session progress, respond to booking requests, and maintain secure communication.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/messages" className="rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors">Open Messages</Link>
            <Link to="/profile" className="interactive-surface rounded-lg px-5 py-2.5 text-sm font-semibold text-[color:var(--text-main)] hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">Profile</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Students" value={overview.totalAll} subtitle="All registered students" tone="info" />
        <Card title="High Risk" value={overview.high} subtitle="Requires immediate attention" tone="danger" />
        <Card title="Moderate Risk" value={overview.moderate} subtitle="Monitoring recommended" tone="warning" />
        <Card title="Pending Appointments" value={sessionMetrics.pending} subtitle="Awaiting response" tone="info" />
      </div>

      <SessionStats metrics={sessionMetrics} />

      <div className="glass-panel rounded-2xl p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-[color:var(--text-main)]">Filter Students</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-control rounded-lg border-2 border-transparent focus:border-blue-500"
            placeholder="Search by name or email"
          />

          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="field-control rounded-lg border-2 border-transparent focus:border-blue-500 cursor-pointer">
            <option value="all">All Risk Levels</option>
            <option value="high">🔴 High Risk</option>
            <option value="moderate">🟡 Moderate Risk</option>
            <option value="low">🟢 Low Risk</option>
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="field-control rounded-lg border-2 border-transparent focus:border-blue-500 cursor-pointer">
            <option value="all">All Categories</option>
            <option value="academic">📚 Academic</option>
            <option value="emotional">💭 Emotional</option>
            <option value="social">👥 Social</option>
            <option value="sleep">😴 Sleep</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((s, i) => (
              <CounselorCard
                key={s.id || i} student={s}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="glass-panel rounded-xl p-8 text-center text-[color:var(--text-muted)] border-2 border-dashed">
              <p className="text-sm font-medium">No students match your current filters</p>
              <p className="text-xs mt-2 opacity-75">Try adjusting your search criteria or risk filters</p>
            </div>
          )}

          <BarChartBox students={filteredStudents} />

          <div className="glass-panel rounded-xl p-5 shadow-sm border">
            <h3 className="mb-4 font-semibold text-[color:var(--text-main)] text-lg">Risk Distribution</h3>
            {filteredStudents.length > 0 ? (
              <div style={{ width: "100%", height: 280 }} className="rounded-lg overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskDistribution} dataKey="value" nameKey="name" outerRadius={85} innerRadius={40}>
                      {riskDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} opacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'var(--panel-strong)' }} />
                    <Legend wrapperStyle={{ paddingTop: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-[color:var(--text-muted)] rounded-lg bg-white/5">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <NotificationPanel students={studentRows} />

          <div className="glass-panel rounded-xl p-5 shadow-sm border">
            <h3 className="mb-4 font-semibold text-[color:var(--text-main)] text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Appointment Requests
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {counsellorAppointments.slice(0, 8).map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onStatusChange={handleUpdateAppointmentStatus}
                />
              ))}
              {counsellorAppointments.length === 0 && (
                <div className="text-center py-8 text-[color:var(--text-muted)]">
                  <p className="text-sm">No pending requests</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5 shadow-sm border">
            <h3 className="mb-4 font-semibold text-[color:var(--text-main)] text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Notifications
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.slice(0, 8).map((n) => (
                <div key={n.id} className={`rounded-lg border px-3 py-3 text-sm transition-colors ${
                  n.isRead !== true && n.read !== true ? "border-blue-400/30 bg-blue-500/8" : "border-white/10 bg-white/3"
                }`}>
                  <p className="font-medium text-[color:var(--text-main)] leading-tight">{n.title}</p>
                  <p className="text-xs text-[color:var(--text-muted)] mt-1">{n.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-8 text-[color:var(--text-muted)]">
                  <p className="text-sm">All caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedStudent(null);
        }}
        onMessage={handleMessage}
        onBookSession={() => setShowBookSession(true)}
      />

      {/* Book Session Modal */}
      <BookSessionModal
        student={selectedStudent}
        open={showBookSession}
        onClose={() => setShowBookSession(false)}
        onBookSession={handleBookSession}
      />
    </div>
  );
}
