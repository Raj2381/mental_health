export default function AdminCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-100',
    green: 'bg-green-500 text-green-100', 
    purple: 'bg-purple-500 text-purple-100',
    red: 'bg-red-500 text-red-100'
  };

  const bgClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200', 
    red: 'bg-red-50 border-red-200'
  };

  return (
    <div className={`rounded-xl border ${bgClasses[color]} p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`text-2xl p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
