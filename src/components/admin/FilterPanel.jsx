import { useMemo } from "react";

export default function FilterPanel({ filters, onFiltersChange, assessments }) {
  const uniqueConcerns = useMemo(() => {
    const concerns = [...new Set(assessments.map(a => a.primaryConcern).filter(Boolean))];
    return concerns.sort();
  }, [assessments]);

  const handleFilterChange = (filterType, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    onFiltersChange({
      riskLevel: 'all',
      dateRange: 'all',
      concern: 'all'
    });
  };

  const hasActiveFilters = filters.riskLevel !== 'all' || filters.dateRange !== 'all' || filters.concern !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Risk Level Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Risk Level
          </label>
          <select
            value={filters.riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="low">Low Risk</option>
            <option value="moderate">Moderate Risk</option>
            <option value="high">High Risk</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>

        {/* Concern Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Primary Concern
          </label>
          <select
            value={filters.concern}
            onChange={(e) => handleFilterChange('concern', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Concerns</option>
            {uniqueConcerns.map(concern => (
              <option key={concern} value={concern}>
                {concern}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.riskLevel !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Risk: {filters.riskLevel}
              <button
                onClick={() => handleFilterChange('riskLevel', 'all')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateRange !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {filters.dateRange === '7days' ? 'Last 7 Days' : 
               filters.dateRange === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
              <button
                onClick={() => handleFilterChange('dateRange', 'all')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.concern !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Concern: {filters.concern}
              <button
                onClick={() => handleFilterChange('concern', 'all')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
