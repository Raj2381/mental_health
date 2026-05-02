export function StudentDetailView({ student }) {
  if (!student) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 text-slate-500">
        Select a student to view details.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-900">{student.name}</h3>
      <p className="text-sm text-slate-600">Risk Score: {student.assessmentScore}</p>
    </div>
  );
}
