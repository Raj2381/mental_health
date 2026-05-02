import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { ArrowLeft } from "lucide-react";

export default function AssessmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const docSnap = await getDoc(doc(db, "assessments", id));
        
        if (docSnap.exists()) {
          setAssessment({ id: docSnap.id, ...docSnap.data() });
          setError(null);
        } else {
          setError("Assessment not found");
        }
      } catch (err) {
        console.error("Error fetching assessment:", err);
        setError(err.message || "Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  const getRiskBadgeColor = (riskLevel) => {
    const level = String(riskLevel || "").toLowerCase();
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const formatDate = (value) => {
    if (!value) return null;
    try {
      const d = value?.toDate ? value.toDate() : new Date(value);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return null;
    }
  };

  const labelMap = {
    academic: 'Academic Stress',
    emotional: 'Emotional Stress',
    sleep: 'Sleep',
    social: 'Social',
    anxietyStress: 'Anxiety / Stress',
    sleepQuality: 'Sleep Quality',
    socialConnection: 'Social Connection',
    academicStress: 'Academic Stress'
  };

  const niceLabel = (key) => {
    if (!key) return '';
    return labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  };

  if (loading) {
    return (
      <div className="h-full bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-slate-600">Loading assessment...</div>
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

  if (!assessment) {
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
          <div className="text-center py-12 text-slate-500">No assessment data available</div>
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
          Back to Assessments
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Assessment Details</h1>
              <p className="text-slate-600">Student: {assessment.name || 'Unknown'}</p>
              <p className="text-slate-600">Email: {assessment.email || 'N/A'}</p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-4 py-2 rounded-full border font-medium ${getRiskBadgeColor(assessment.riskLevel)}`}>
                {(assessment.riskLevel || "Unknown").toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Score & Risk */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-slate-600 mb-2">Overall Score</h3>
            <p className={`text-4xl font-bold ${getScoreColor(assessment.score)}`}>
              {assessment.score ?? 'N/A'}
              <span className="text-lg text-slate-600">/100</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-slate-600 mb-2">Primary Concern</h3>
            <p className="text-2xl font-semibold text-slate-900">{assessment.primaryConcern || 'None'}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm text-slate-600 mb-2">Assessment Date</h3>
            <p className="text-lg font-semibold text-slate-900">
              {assessment.createdAt ? new Date(assessment.createdAt.toDate?.() || assessment.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Stress Breakdown */}
        {assessment.stressBreakdown && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Stress Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(assessment.stressBreakdown).map(([key, value]) => (
                <div key={key} className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm text-slate-600 capitalize">{key}</div>
                  <div className="text-2xl font-bold text-slate-900">{value ?? 0}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions & Responses */}
        {assessment.responses && Object.keys(assessment.responses).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Assessment Responses</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(assessment.responses).map(([question, response]) => (
                <div key={question} className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-slate-600">Q: {question}</p>
                  <p className="text-slate-900 font-medium">A: {response}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structured Full Record */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Info</h2>
            <div className="space-y-3 text-sm text-slate-700">
              {assessment.name && (
                <div>
                  <div className="text-xs text-slate-500">Name</div>
                  <div className="text-slate-900">{assessment.name}</div>
                </div>
              )}
              {assessment.email && (
                <div>
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="text-slate-900">{assessment.email}</div>
                </div>
              )}
              {assessment.createdAt && (
                <div>
                  <div className="text-xs text-slate-500">Date</div>
                  <div className="text-slate-900">{formatDate(assessment.createdAt)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Score Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Score Info</h2>
            <div className="space-y-3 text-sm text-slate-700">
              {assessment.score != null && (
                <div>
                  <div className="text-xs text-slate-500">Overall Score</div>
                  <div className={`text-3xl font-bold ${getScoreColor(assessment.score)}`}>{assessment.score}<span className="text-sm text-slate-600">/100</span></div>
                </div>
              )}
              {assessment.riskLevel && (
                <div>
                  <div className="text-xs text-slate-500">Risk Level</div>
                  <div className="text-slate-900">{assessment.riskLevel}</div>
                </div>
              )}
              {assessment.primaryConcern && (
                <div>
                  <div className="text-xs text-slate-500">Primary Concern</div>
                  <div className="text-slate-900">{assessment.primaryConcern}</div>
                </div>
              )}
            </div>
          </div>

          {/* Category Scores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Category Scores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
              {['anxietyStress','sleepQuality','socialConnection','academicStress'].map((k) => (
                assessment[k] != null ? (
                  <div key={k} className="bg-slate-50 p-3 rounded">
                    <div className="text-xs text-slate-500">{niceLabel(k)}</div>
                    <div className="text-slate-900 font-medium">{assessment[k]}</div>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        </div>

        {/* Stress Breakdown (full width) */}
        {assessment.stressBreakdown && Object.keys(assessment.stressBreakdown).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Stress Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {['academic','emotional','sleep','social'].map((k) => (
                assessment.stressBreakdown[k] != null ? (
                  <div key={k} className="bg-slate-50 p-4 rounded-lg">
                    <div className="text-xs text-slate-500">{niceLabel(k)}</div>
                    <div className="text-2xl font-bold text-slate-900">{assessment.stressBreakdown[k]}</div>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
