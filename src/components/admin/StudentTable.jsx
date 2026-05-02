import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentTable({ students, assessments }) {
  const navigate = useNavigate();
  const studentsWithRisk = useMemo(() => {
    return students.map(student => {
      const studentAssessments = assessments.filter(a => a.userId === student.id);
      const latestAssessment = studentAssessments[0];
      
      return {
        ...student,
        latestAssessment,
        riskScore: student.riskScore ?? latestAssessment?.score ?? 0,
        riskLevel: student.riskLevel || latestAssessment?.riskLevel || 'none',
        lastActivity: student.lastAssessment || latestAssessment?.createdAt || student.updatedAt || student.createdAt
      };
    }).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  }, [students, assessments]);

  const getRiskBadge = (riskLevel) => {
    const normalizedRiskLevel = String(riskLevel || "none").toLowerCase();
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200',
      none: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[normalizedRiskLevel]}`}>
        {normalizedRiskLevel === 'none' ? 'No Assessment' : normalizedRiskLevel.charAt(0).toUpperCase() + normalizedRiskLevel.slice(1)}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {studentsWithRisk.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {student.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">
                        {student.name || 'Unknown Student'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">{student.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {getRiskBadge(student.riskLevel)}
                    <div className="text-xs text-slate-500">Score: {student.riskScore ?? 0}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">
                    {formatDate(student.lastActivity)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigate(`/admin/student/${student.id}`)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View Profile
                    </button>
                    {student.latestAssessment && (
                      <button 
                        onClick={() => navigate(`/admin/assessment/${student.latestAssessment.id}`)}
                        className="text-purple-600 hover:text-purple-900 font-medium"
                      >
                        View Assessment
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {studentsWithRisk.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500">No students found</div>
        </div>
      )}
    </div>
  );
}
