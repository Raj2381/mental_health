import { useEffect, useState, useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { watchAllUsers } from "../../services/firebase/users";
import { watchAllAssessments, getRiskDistribution, getTopConcerns, getDailyAssessmentCounts } from "../../services/firebase/assessments";
import AdminCard from "../../components/admin/AdminCard";
import StudentTable from "../../components/admin/StudentTable";
import AssessmentTable from "../../components/admin/AssessmentTable";
import AnalyticsCharts from "../../components/admin/AnalyticsCharts";
import FilterPanel from "../../components/admin/FilterPanel";

const COLORS = {
  low: "#22c55e",
  moderate: "#f59e0b", 
  high: "#ef4444"
};

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    riskLevel: 'all',
    dateRange: 'all',
    concern: 'all'
  });

  useEffect(() => {
    setLoading(true);
    const unsubAllUsers = watchAllUsers((data) => {
      setStudents(data.filter((user) => String(user.role || "").toLowerCase() === "student"));
      setCounsellors(data.filter((user) => String(user.role || "").toLowerCase() === "counsellor"));
      setLoading(false);
    });
    const unsubAssessments = watchAllAssessments((data) => {
      setAssessments(data);
    });

    return () => {
      unsubAllUsers();
      unsubAssessments();
    };
  }, []);

  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      if (filters.riskLevel !== 'all' && assessment.riskLevel !== filters.riskLevel) {
        return false;
      }
      if (filters.concern !== 'all' && assessment.primaryConcern !== filters.concern) {
        return false;
      }
      if (filters.dateRange !== 'all') {
        const assessmentDate = new Date(assessment.createdAt?.toDate?.() || assessment.createdAt);
        const today = new Date();
        
        switch(filters.dateRange) {
          case '7days':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (assessmentDate < weekAgo) return false;
            break;
          case '30days':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (assessmentDate < monthAgo) return false;
            break;
          case '90days':
            const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
            if (assessmentDate < quarterAgo) return false;
            break;
        }
      }
      return true;
    });
  }, [assessments, filters]);

  const stats = useMemo(() => {
    const highRiskCount = students.filter((student) => String(student.riskLevel || "").toLowerCase() === "high").length;

    return {
      totalStudents: students.length,
      totalCounsellors: counsellors.length,
      totalAssessments: assessments.length,
      highRiskStudents: highRiskCount
    };
  }, [students, counsellors, assessments]);

  const analyticsData = useMemo(() => {
    const riskDistribution = getRiskDistribution(filteredAssessments);
    const topConcerns = getTopConcerns(filteredAssessments);
    const dailyCounts = getDailyAssessmentCounts(filteredAssessments);

    const riskChartData = Object.entries(riskDistribution).map(([level, count]) => ({
      name: level.charAt(0).toUpperCase() + level.slice(1),
      value: count,
      fill: COLORS[level]
    }));

    const concernChartData = topConcerns.map(concern => ({
      ...concern,
      fill: CHART_COLORS[topConcerns.indexOf(concern) % CHART_COLORS.length]
    }));

    return {
      riskChartData,
      concernChartData,
      dailyChartData: dailyCounts.slice(-30).map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))
    };
  }, [filteredAssessments]);

  if (loading) {
    return (
      <div className="h-full bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Student Wellness Platform Management</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminCard 
            title="Total Students" 
            value={stats.totalStudents} 
            icon="👥"
            color="blue"
          />
          <AdminCard 
            title="Total Counsellors" 
            value={stats.totalCounsellors} 
            icon="👨‍⚕️"
            color="green"
          />
          <AdminCard 
            title="Total Assessments" 
            value={stats.totalAssessments} 
            icon="📊"
            color="purple"
          />
          <AdminCard 
            title="High Risk Students" 
            value={stats.highRiskStudents} 
            icon="⚠️"
            color="red"
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AnalyticsCharts 
            title="Risk Distribution"
            data={analyticsData.riskChartData}
            type="pie"
          />
          <AnalyticsCharts 
            title="Top Concerns"
            data={analyticsData.concernChartData}
            type="bar"
          />
        </div>

        <div className="mb-8">
          <AnalyticsCharts 
            title="Daily Assessment Trends (Last 30 Days)"
            data={analyticsData.dailyChartData}
            type="line"
          />
        </div>

        {/* Filters */}
        <FilterPanel 
          filters={filters}
          onFiltersChange={setFilters}
          assessments={assessments}
        />

        {/* Student Management */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Student Management</h2>
          <StudentTable 
            students={students}
            assessments={assessments}
          />
        </div>

        {/* Assessment Analytics */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Assessment Analytics</h2>
          <AssessmentTable 
            assessments={filteredAssessments}
          />
        </div>
      </div>
    </div>
  );
}
