export default function SessionRequests({ selectedStudent, highRiskStudents = [] }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <h2 className="text-lg font-semibold text-slate-900">Session / Contact Panel</h2>
      <p className="mt-1 text-sm text-slate-600">
        Focus on communication and scheduling. This panel is view-only.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Book Session
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Message Student
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-800">
          {selectedStudent
            ? `Current selection: ${selectedStudent.name}`
            : "Select a student from the list to prepare session notes."}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-800">Priority Queue</p>
        <div className="mt-2 space-y-2">
          {highRiskStudents.slice(0, 4).map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-3 py-2"
            >
              <span className="text-sm text-rose-800">{student.name}</span>
              <span className="text-xs font-semibold text-rose-700">
                Score {student.assessmentScore}
              </span>
            </div>
          ))}
          {highRiskStudents.length === 0 && (
            <p className="text-sm text-slate-500">No high-risk students at the moment.</p>
          )}
        </div>
      </div>
    </section>
  );
}
