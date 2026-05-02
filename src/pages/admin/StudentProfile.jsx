import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { ArrowLeft } from "lucide-react";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const docSnap = await getDoc(doc(db, "users", id));
        
        if (docSnap.exists()) {
          setStudent({ id: docSnap.id, ...docSnap.data() });
          setError(null);
        } else {
          setError("Student not found");
        }
      } catch (err) {
        console.error("Error fetching student:", err);
        setError(err.message || "Failed to load student profile");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const formatDate = (value) => {
    if (!value) return null;
    try {
      const d = value?.toDate ? value.toDate() : new Date(value);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-slate-600">Loading student profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-full bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="text-center py-12 text-slate-500">No student data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Students
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {student.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{student.name || 'Unknown'}</h1>
                <p className="text-slate-600">{student.email || 'No email'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Role</div>
              <div className="text-lg font-semibold text-slate-900 capitalize">{student.role || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600">Full Name</label>
                <p className="text-slate-900">{student.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <p className="text-slate-900">{student.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">User ID</label>
                <p className="text-slate-900 text-sm font-mono">{student.id}</p>
              </div>
            </div>
          </div>

          {/* Wellness Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Wellness Status</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600">Risk Level</label>
                <p className="text-slate-900 capitalize">{student.riskLevel || 'None'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Risk Score</label>
                <p className="text-slate-900">{student.riskScore ?? 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Last Active</label>
                <p className="text-slate-900">
                  {student.lastActiveDate ? new Date(student.lastActiveDate).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Academic Info */}
          {student.profile && (student.profile.department || student.profile.year || student.profile.college) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Academic Information</h2>
              <div className="space-y-3 text-sm text-slate-700">
                {student.profile.department && (
                  <div>
                    <div className="text-xs text-slate-500">Department</div>
                    <div className="text-slate-900">{student.profile.department}</div>
                  </div>
                )}
                {student.profile.year && (
                  <div>
                    <div className="text-xs text-slate-500">Year</div>
                    <div className="text-slate-900">{student.profile.year}</div>
                  </div>
                )}
                {student.profile.college && (
                  <div>
                    <div className="text-xs text-slate-500">College</div>
                    <div className="text-slate-900">{student.profile.college}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {(student.email || (student.profile && (student.profile.phone || student.profile.address))) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>
              <div className="space-y-3 text-sm text-slate-700">
                {student.email && (
                  <div>
                    <div className="text-xs text-slate-500">Email</div>
                    <div className="text-slate-900">{student.email}</div>
                  </div>
                )}
                {student.profile?.phone && (
                  <div>
                    <div className="text-xs text-slate-500">Phone</div>
                    <div className="text-slate-900">{student.profile.phone}</div>
                  </div>
                )}
                {student.profile?.address && (
                  <div>
                    <div className="text-xs text-slate-500">Address</div>
                    <div className="text-slate-900">{student.profile.address}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Wellness & Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Wellness Summary</h2>
            <div className="space-y-3 text-sm text-slate-700">
              {student.riskLevel && (
                <div>
                  <div className="text-xs text-slate-500">Risk Level</div>
                  <div className="text-slate-900 capitalize">{student.riskLevel}</div>
                </div>
              )}
              {student.riskScore != null && (
                <div>
                  <div className="text-xs text-slate-500">Risk Score</div>
                  <div className="text-slate-900">{student.riskScore}</div>
                </div>
              )}
              {student.lastActiveDate && (
                <div>
                  <div className="text-xs text-slate-500">Last Active</div>
                  <div className="text-slate-900">{formatDate(student.lastActiveDate)}</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Record Details</h2>
            <div className="space-y-3 text-sm text-slate-700">
              {student.createdAt && (
                <div>
                  <div className="text-xs text-slate-500">Created</div>
                  <div className="text-slate-900">{formatDate(student.createdAt)}</div>
                </div>
              )}
              {student.updatedAt && (
                <div>
                  <div className="text-xs text-slate-500">Updated</div>
                  <div className="text-slate-900">{formatDate(student.updatedAt)}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-slate-500">Document ID</div>
                <div className="text-slate-900 font-mono text-sm">{student.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
