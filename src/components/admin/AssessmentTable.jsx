import { useNavigate } from "react-router-dom";

export default function AssessmentTable({ assessments }) {
  const navigate = useNavigate();
  const getRiskBadge = (riskLevel) => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };

    const level = String(riskLevel || '').toLowerCase().trim();
    if (!level) return <span className="px-2 py-1 text-xs text-gray-500">N/A</span>;

    const style = styles[level] || 'bg-gray-100 text-gray-800 border-gray-200';
    const label = level.charAt(0).toUpperCase() + level.slice(1);

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${style}`}>
        {label}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-red-600 font-semibold';
    if (score >= 40) return 'text-yellow-600 font-semibold';
    return 'text-green-600 font-semibold';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTopStressArea = (stressBreakdown) => {
    if (!stressBreakdown) return 'N/A';
    
    const areas = [
      { name: 'Academic', value: stressBreakdown.academic || 0 },
      { name: 'Social', value: stressBreakdown.social || 0 },
      { name: 'Emotional', value: stressBreakdown.emotional || 0 },
      { name: 'Sleep', value: stressBreakdown.sleep || 0 }
    ];

    const top = areas.reduce((max, area) => area.value > max.value ? area : max);
    return top.value > 0 ? top.name : 'None';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Primary Concern
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Top Stress Area
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {assessments.map((assessment) => (
              <tr key={assessment.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                        {assessment.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-slate-900">
                        {assessment.name || 'Unknown'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">{assessment.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${getScoreColor(assessment.score)}`}>
                    {assessment.score || 0}/100
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRiskBadge(assessment.riskLevel)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">
                    {assessment.primaryConcern || 'None specified'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">
                    {getTopStressArea(assessment.stressBreakdown)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">
                    {formatDate(assessment.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigate(`/admin/assessment/${assessment.id}`)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View Details
                    </button>
                    <button className="text-purple-600 hover:text-purple-900 font-medium">
                      Export
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {assessments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500">No assessments found matching the current filters</div>
        </div>
      )}
    </div>
  );
}
