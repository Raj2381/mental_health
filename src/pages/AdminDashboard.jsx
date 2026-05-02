import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { watchUsersByRole } from "../services/firebase/users";
import { watchAllAppointments } from "../services/firebase/appointments";
import { watchAllNotifications } from "../services/firebase/notifications";
import { watchAllAssessments } from "../services/firebase/assessments";
import AdminStatCard from "../components/admin/AdminStatCard";
import AdminPanel from "../components/admin/AdminPanel";

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [studentUsers, setStudentUsers] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [concernFilter, setConcernFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const unsubs = [
      watchAllAssessments(setAssessments),
      watchUsersByRole("student", setStudentUsers),
      watchUsersByRole("counsellor", setCounsellors),
      watchUsersByRole("admin", setAdmins),
      watchAllAppointments(setAppointments),
      watchAllNotifications(setNotifications),
    ];

    return () => unsubs.forEach((fn) => fn?.());
  }, []);

  const riskStats = useMemo(() => {
    let high = 0;
    let moderate = 0;
    let low = 0;

    assessments.forEach((assessment) => {
      const level = String(assessment.riskLevel || "").toLowerCase();
      if (level === "high") high += 1;
      else if (level === "moderate") moderate += 1;
      else low += 1;
    });

    return { high, moderate, low };
  }, [assessments]);

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesSearch = [assessment.name, assessment.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search.toLowerCase()));
      const matchesRisk = riskFilter === "all" || String(assessment.riskLevel || "").toLowerCase() === riskFilter;
      const matchesConcern = concernFilter === "all" || String(assessment.primaryConcern || "").toLowerCase() === concernFilter;
      const matchesDate = !dateFilter || new Date(
        typeof assessment.createdAt?.toDate === "function" ? assessment.createdAt.toDate() : assessment.createdAt
      ).toISOString().slice(0, 10) === dateFilter;
      return matchesSearch && matchesRisk && matchesConcern && matchesDate;
    });
  }, [assessments, concernFilter, dateFilter, riskFilter, search]);

  const concernOptions = useMemo(
    () => [...new Set(assessments.map((assessment) => assessment.primaryConcern).filter(Boolean))],
    [assessments]
  );

  const roleDistribution = [
    { name: "Students", value: studentUsers.length },
    { name: "Counsellors", value: counsellors.length },
    { name: "Admins", value: admins.length },
  ];

  const riskData = [
    { name: "High", value: riskStats.high },
    { name: "Moderate", value: riskStats.moderate },
    { name: "Low", value: riskStats.low },
  ];

  const appointmentBars = [
    { name: "Pending", value: appointments.filter((a) => a.status === "pending").length },
    { name: "Accepted", value: appointments.filter((a) => a.status === "accepted").length },
    { name: "Rejected", value: appointments.filter((a) => a.status === "rejected").length },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">Real-time platform analytics across roles and appointments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminStatCard title="Users" value={studentUsers.length + counsellors.length + admins.length} />
        <AdminStatCard title="Students" value={studentUsers.length} />
        <AdminStatCard title="Counsellors" value={counsellors.length} />
        <AdminStatCard title="Assessments" value={assessments.length} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2" placeholder="Search name or email" />
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2">
            <option value="all">All risk levels</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
          <select value={concernFilter} onChange={(e) => setConcernFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2">
            <option value="all">All concerns</option>
            {concernOptions.map((concern) => (
              <option key={concern} value={concern}>{concern}</option>
            ))}
          </select>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AdminPanel title="Role Distribution">
          <ChartWrap>
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={240} aspect={2}>
              <PieChart>
                <Pie data={roleDistribution} dataKey="value" outerRadius={90}>
                  {roleDistribution.map((entry, idx) => <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrap>
        </AdminPanel>

        <AdminPanel title="Student Risk Distribution">
          <ChartWrap>
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={240} aspect={2}>
              <PieChart>
                <Pie data={riskData} dataKey="value" outerRadius={90}>
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#22c55e" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrap>
        </AdminPanel>
      </div>

      <AdminPanel title="Appointment Status">
        <ChartWrap>
          <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={240} aspect={2}>
            <BarChart data={appointmentBars}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrap>
      </AdminPanel>

      <AdminPanel title="Recent Counsellor Notifications">
        <div className="space-y-2">
          {notifications.slice(0, 8).map((n) => (
            <div key={n.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-sm font-medium text-slate-800">{n.title}</p>
              <p className="text-xs text-slate-600">{n.message}</p>
            </div>
          ))}
          {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications yet.</p>}
        </div>
      </AdminPanel>

      <AdminPanel title="Assessment Reports">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Risk Level</th>
                <th className="px-3 py-2">Concern</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssessments.slice(0, 20).map((assessment) => (
                <tr key={assessment.id}>
                  <td className="px-3 py-3 font-medium text-slate-900">{assessment.name}</td>
                  <td className="px-3 py-3 text-slate-700">{assessment.score}</td>
                  <td className="px-3 py-3 capitalize text-slate-700">{assessment.riskLevel}</td>
                  <td className="px-3 py-3 capitalize text-slate-700">{String(assessment.primaryConcern || "general").replace(/([A-Z])/g, " $1")}</td>
                  <td className="px-3 py-3 text-slate-500">
                    {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
                      typeof assessment.createdAt?.toDate === "function" ? assessment.createdAt.toDate() : new Date(assessment.createdAt)
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <button type="button" className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAssessments.length === 0 && <p className="px-3 py-6 text-sm text-slate-500">No assessments match the active filters.</p>}
        </div>
      </AdminPanel>
    </div>
  );
}

function ChartWrap({ children }) {
  return <div className="h-72 w-full min-w-[280px] min-h-[240px]">{children}</div>;
}
