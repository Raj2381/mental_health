import { useEffect, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import { getCurrentUser } from "../services/auth";
import { watchUserAttendance, addSubjectWithInitialData, updateAttendanceClass } from "../services/firebase/attendance";
import DashboardCard from "../components/dashboard/DashboardCard";
import AddSubjectForm from "../components/attendance/AddSubjectForm";
import AttendanceList from "../components/attendance/AttendanceList";
import AttendanceSummary from "../components/attendance/AttendanceSummary";
import AnalyticsChart from "../components/dashboard/AnalyticsChart";
import { buildAttendanceTrend, calculateSubjectAttendance } from "../utils/attendanceCalc";

export default function Attendance() {
  const [subjects, setSubjects] = useState([]);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [user, setUser] = useState(null);

  // Initialize user and set up listeners
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser?.id) {
      setUser(currentUser);
      
      // Watch attendance data for real-time updates
      const unsubscribeAttendance = watchUserAttendance(currentUser.id, (attendanceData) => {
        console.log("Attendance fetched", attendanceData?.length || 0);
        setSubjects(attendanceData);
      });

      return () => {
        unsubscribeAttendance?.();
      };
    }
  }, []);

  const subjectStats = useMemo(
    () => subjects.map((subject) => ({ ...subject, ...calculateSubjectAttendance(subject) })),
    [subjects]
  );

  const overall = useMemo(() => {
    const totals = subjects.reduce(
      (acc, subject) => {
        acc.attended += Number(subject.attendedClasses || 0);
        acc.total += Number(subject.totalClasses || 0);
        acc.classesNeeded += Number(subject.classesNeeded || 0);
        acc.safeToSkip += Number(subject.safeToSkip || 0);
        return acc;
      },
      { attended: 0, total: 0, classesNeeded: 0, safeToSkip: 0 }
    );
    const percentage = totals.total ? Number(((totals.attended / totals.total) * 100).toFixed(1)) : 0;
    return {
      attended: totals.attended,
      total: totals.total,
      percentage,
      lowSubjects: subjectStats.filter((subject) => subject.percentage < 60).length,
      belowTarget: subjectStats.filter((subject) => subject.percentage < 75).length,
      classesNeeded: totals.classesNeeded,
      safeToSkip: totals.safeToSkip,
      initialized: subjects.filter((subject) => subject.isInitialized).length,
      totalSubjects: subjects.length,
    };
  }, [subjectStats, subjects]);

  const trendData = useMemo(() => buildAttendanceTrend(subjects), [subjects]);

  const handleAddSubject = async (payload) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return false;
    }
    setCreating(true);
    try {
      console.log("✅ [ATTENDANCE] Adding subject for user:", user.id, "Payload:", payload);
      await addSubjectWithInitialData(user.id, payload);
      toast.success("Subject added successfully");
      return true;
    } catch (error) {
      console.error("❌ [ATTENDANCE] Error adding subject:", error);
      toast.error("Unable to save subject");
      return false;
    } finally {
      setCreating(false);
    }
  };

  const handleMarkAttendance = async (subjectId, type) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }
    setUpdatingId(subjectId);
    try {
      console.log("✅ [ATTENDANCE] Marking attendance:", subjectId, "Type:", type);
      await updateAttendanceClass(user.id, subjectId, type);
      toast.success(`Attendance updated`);
    } catch (error) {
      console.error("❌ [ATTENDANCE] Error updating attendance:", error);
      toast.error("Unable to update attendance");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="space-y-6">
      <DashboardCard className="p-6 md:p-8" glow="from-amber-500/16 via-sky-500/8 to-violet-500/10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Attendance Intelligence</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[color:var(--text-main)]">Subject-wise attendance command center</h1>
            <p className="soft-text mt-3 max-w-2xl text-sm leading-7">Track every subject, identify risk early, and know exactly how many classes to attend or safely skip.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Overall</p>
              <p className="mt-2 text-2xl font-black text-[color:var(--text-main)]">{overall.percentage}%</p>
            </div>
            <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Initialized</p>
              <p className="mt-2 text-2xl font-black text-[color:var(--text-main)]">{overall.initialized}</p>
            </div>
            <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Danger</p>
              <p className="mt-2 text-2xl font-black text-[color:var(--text-main)]">{overall.lowSubjects}</p>
            </div>
            <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Tracked</p>
              <p className="mt-2 text-2xl font-black text-[color:var(--text-main)]">{overall.attended}/{overall.total}</p>
            </div>
          </div>
        </div>
      </DashboardCard>

      <AddSubjectForm
        onSubmit={handleAddSubject}
        saving={creating}
        disabled={false}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AttendanceSummary overall={overall} />
        <AnalyticsChart
          title="Attendance Trend"
          data={trendData}
          lines={[{ dataKey: "attendance", color: "#22c55e" }]}
        />
      </div>

      <AttendanceList
        subjects={subjectStats.map((subject) => ({
          ...subject,
          updating: updatingId === subject.id,
        }))}
        onMarkAttendance={handleMarkAttendance}
        disabled={false}
      />

      <DashboardCard className="p-6" glow="from-emerald-500/12 via-sky-500/6 to-violet-500/10">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-emerald-500" />
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--text-main)]">Smart attendance insights</h3>
            <p className="soft-text mt-1 text-sm">Use these insights to stay above the 75% target with confidence.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/45 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Current total</p>
            <p className="mt-2 text-3xl font-black text-[color:var(--text-main)]">{overall.percentage}%</p>
          </div>
          <div className="rounded-2xl bg-white/45 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Needed to recover</p>
            <p className="mt-2 text-3xl font-black text-[color:var(--text-main)]">
              {subjectStats.reduce((sum, subject) => sum + Number(subject.classesNeeded || 0), 0)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/45 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Safe skips</p>
            <p className="mt-2 text-3xl font-black text-[color:var(--text-main)]">
              {subjectStats.reduce((sum, subject) => sum + Number(subject.safeToSkip || 0), 0)}
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
