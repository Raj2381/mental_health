import { useEffect, useState } from "react";
import { watchAllUsers } from "../../services/firebase/users";
import StudentTable from "../../components/admin/StudentTable";
import AdminCard from "../../components/admin/AdminCard";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Fetch only students
    const unsubUsers = watchAllUsers((data) => {
      const studentList = data.filter((user) => String(user.role || "").toLowerCase() === "student");
      setStudents(studentList);
      setLoading(false);
    });

    return () => {
      unsubUsers();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Students</h1>
        <p className="text-slate-600">Manage and monitor all students</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AdminCard 
          title="Total Students" 
          value={students.length} 
          icon="👥"
          color="blue"
        />
        <AdminCard 
          title="Active Today" 
          value={students.filter(s => s.lastActiveDate === new Date().toISOString().split('T')[0]).length} 
          icon="✨"
          color="green"
        />
        <AdminCard 
          title="Needs Attention" 
          value={students.filter(s => String(s.riskLevel || "").toLowerCase() === "high").length} 
          icon="⚠️"
          color="red"
        />
      </div>

      {/* Student Management */}
      <div className="bg-white rounded-lg shadow">
        <StudentTable 
          students={students}
          assessments={assessments}
        />
      </div>
    </div>
  );
}
