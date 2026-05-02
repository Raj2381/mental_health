import { useEffect, useState, useMemo } from "react";
import { watchAllAssessments } from "../../services/firebase/assessments";
import AssessmentTable from "../../components/admin/AssessmentTable";
import AdminCard from "../../components/admin/AdminCard";

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    riskLevel: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    setLoading(true);
    
    // Fetch only assessments
    const unsubAssessments = watchAllAssessments((data) => {
      setAssessments(data);
      setLoading(false);
    });

    return () => {
      unsubAssessments();
    };
  }, []);

  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      if (filters.riskLevel !== 'all' && assessment.riskLevel !== filters.riskLevel) {
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
    const highRisk = assessments.filter(a => String(a.riskLevel || "").toLowerCase() === "high").length;
    const moderate = assessments.filter(a => String(a.riskLevel || "").toLowerCase() === "moderate").length;
    
    return {
      totalAssessments: assessments.length,
      highRiskCount: highRisk,
      moderateRiskCount: moderate
    };
  }, [assessments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading assessments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Assessments</h1>
        <p className="text-slate-600">View and analyze all student assessments</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AdminCard 
          title="Total Assessments" 
          value={stats.totalAssessments} 
          icon="📋"
          color="blue"
        />
        <AdminCard 
          title="High Risk" 
          value={stats.highRiskCount} 
          icon="🔴"
          color="red"
        />
        <AdminCard 
          title="Moderate Risk" 
          value={stats.moderateRiskCount} 
          icon="🟡"
          color="yellow"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600 block mb-2">Risk Level</label>
            <select 
              value={filters.riskLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600 block mb-2">Date Range</label>
            <select 
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assessment Analytics */}
      <div className="bg-white rounded-lg shadow">
        <AssessmentTable 
          assessments={filteredAssessments}
        />
      </div>
    </div>
  );
}
