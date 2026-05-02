export default function AttendanceCard({ attendance }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3>Attendance</h3>
      <p>{attendance || 0}%</p>
    </div>
  );
}
