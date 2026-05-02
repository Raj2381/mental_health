import StudentCard from "./StudentCard";

export default function StudentList({ students, onViewDetails }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Student List</h2>
        <p className="text-sm text-slate-500">{students.length} records</p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No students match your current search/filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </section>
  );
}
