import { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { BarChart3, TrendingDown, Target, Flame, AlertCircle } from 'lucide-react';
import { auth, db } from '../../firebase';
import { 
  watchCounsellorStudentProgress,
  getCounsellorStudentProgress 
} from '../../services/firebase/adaptiveDailyProgress';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const colors = {
  social: 'text-blue-600',
  anxiety: 'text-orange-600',
  academic: 'text-purple-600',
  sleep: 'text-indigo-600',
  emotional: 'text-rose-600',
};

const categoryLabels = {
  social: '👥 Social',
  anxiety: '😰 Anxiety',
  academic: '📚 Academic',
  sleep: '😴 Sleep',
  emotional: '💭 Emotional',
};

export default function CounsellorDashboardProgress() {
  const [userId, setUserId] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentProgress, setStudentProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'atrisk', 'improving'

  // Get counsellor auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
      if (!user?.uid) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Get counsellor's assigned students
  useEffect(() => {
    if (!userId) return;

    const studentsRef = collection(db, 'student_data');
    const q = query(studentsRef, where('assignedCounsellor', '==', userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentList);
    });

    return () => unsubscribe();
  }, [userId]);

  // Watch progress for all students
  useEffect(() => {
    if (!students.length) {
      setLoading(false);
      return;
    }

    const studentIds = students.map((s) => s.id);
    const unsubscribers = watchCounsellorStudentProgress(studentIds, (data) => {
      setStudentProgress((prev) => ({
        ...prev,
        [data.studentId]: data,
      }));
      setLoading(false);
    });

    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, [students]);

  // Filter students based on progress
  const filteredStudents = students.filter((student) => {
    const progress = studentProgress[student.id];
    if (filter === 'atrisk') {
      return (progress?.completionPercent || 0) < 40;
    }
    if (filter === 'improving') {
      const streak = progress?.streakData?.currentStreak || 0;
      return streak >= 3;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold flex items-center space-x-2 mb-2">
          <BarChart3 className="w-6 h-6" />
          <span>Student Progress Overview</span>
        </h2>
        <p className="text-slate-300 text-sm">
          Monitor daily task completion, streaks, and score improvements for your students
        </p>
      </Motion.div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: `All Students (${students.length})` },
          { key: 'atrisk', label: `At Risk (${students.filter((s) => (studentProgress[s.id]?.completionPercent || 0) < 40).length})` },
          { key: 'improving', label: `On Fire (${students.filter((s) => (studentProgress[s.id]?.streakData?.currentStreak || 0) >= 3).length})` },
        ].map((tab) => (
          <Motion.button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {tab.label}
          </Motion.button>
        ))}
      </div>

      {/* Students Grid */}
      <div className="grid gap-4">
        {filteredStudents.map((student, index) => (
          <StudentProgressCard
            key={student.id}
            student={student}
            progress={studentProgress[student.id]}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center"
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-blue-600" />
          <h4 className="font-semibold text-blue-900 mb-2">No Students Found</h4>
          <p className="text-sm text-blue-700">
            {filter === 'atrisk'
              ? 'All your students are performing well! 🎉'
              : filter === 'improving'
              ? 'No students on fire yet. Keep encouraging them! 🔥'
              : 'You have no assigned students yet.'}
          </p>
        </Motion.div>
      )}
    </div>
  );
}

/**
 * Individual student progress card
 */
function StudentProgressCard({ student, progress, delay }) {
  const completion = progress?.todayProgress?.completionPercent || 0;
  const streak = progress?.streakData?.currentStreak || 0;
  const weakCategories = getWeakCategories(progress?.todayProgress?.categoryScores || {});
  const isAtRisk = completion < 40;
  const isImproving = streak >= 3;

  return (
    <Motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-xl border-2 p-5 shadow-sm transition-all hover:shadow-md ${
        isAtRisk
          ? 'border-red-300 bg-red-50/50'
          : isImproving
          ? 'border-green-300 bg-green-50/50'
          : 'border-slate-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-slate-900">{student.name || 'Student'}</h4>
          <p className="text-sm text-slate-500">{student.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isAtRisk && (
            <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
              At Risk
            </span>
          )}
          {isImproving && (
            <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full flex items-center space-x-1">
              <Flame className="w-3 h-3" />
              <span>{streak}d</span>
            </span>
          )}
        </div>
      </div>

      {/* Completion Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-slate-600">Today's Completion</span>
          <span className="text-sm font-bold text-slate-900">{completion}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <Motion.div
            className={`h-full rounded-full ${
              completion >= 80
                ? 'bg-green-500'
                : completion >= 60
                ? 'bg-blue-500'
                : completion >= 40
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-600 mb-1">Streak</p>
          <p className="text-2xl font-bold text-amber-600">{streak}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-600 mb-1">Tasks Today</p>
          <p className="text-2xl font-bold text-blue-600">
            {progress?.todayProgress?.base?.completed || 0}/{progress?.todayProgress?.base?.total || 0}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-600 mb-1">Trending</p>
          <p className="text-lg font-bold">
            {isImproving ? '📈' : isAtRisk ? '📉' : '➡️'}
          </p>
        </div>
      </div>

      {/* Weak Categories */}
      {weakCategories.length > 0 && (
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <p className="text-xs font-semibold text-orange-900 mb-2 flex items-center space-x-1">
            <Target className="w-3 h-3" />
            <span>Focus Areas</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {weakCategories.map((cat) => (
              <span key={cat.category} className={`text-xs font-medium px-2 py-1 bg-white rounded-full ${colors[cat.category]}`}>
                {categoryLabels[cat.category]} ({Math.round(cat.score)})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <Motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        View Detailed Report
      </Motion.button>
    </Motion.div>
  );
}

/**
 * Get weak categories (highest scores = worst performance)
 */
function getWeakCategories(scores) {
  return Object.entries(scores || {})
    .map(([category, score]) => ({
      category: category.replace('Stress', '').replace('Quality', '').replace('Connection', '').replace('Wellbeing', '').toLowerCase(),
      score,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .filter((item) => item.category && item.score > 60);
}
