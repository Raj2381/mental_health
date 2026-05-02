export function StudentListPanel({ students = [], onSelectStudent }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Students</h3>
      <div className="space-y-2">
        {students.map((student) => (
          <button
            key={student.id}
            onClick={() => onSelectStudent?.(student)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
          >
            {student.name}
          </button>
        ))}
      </div>
    </div>
  );
}
