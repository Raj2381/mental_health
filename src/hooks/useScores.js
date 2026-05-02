import { useEffect, useMemo, useCallback, useState } from "react";
import { onSnapshot, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import {
  calculateActivityScore,
  calculateConsistencyScore,
  calculateMentalScore,
  calculateAttendanceScore,
  calculateXP,
  getLevelFromXP,
  getScoreStatus,
  clamp,
} from "../utils/scoringSystem";

/**
 * Hook to manage real-time score calculations
 * Subscribes to dailyActivities, dailyMetrics, assessments, and attendance
 * 
 * @param {string} userId - Current user ID
 * @returns {Object} { activityScore, consistencyScore, mentalScore, xp, level, loading, error, scores }
 */
export function useScores(userId) {
  const [dailyActivity, setDailyActivity] = useState(null);
  const [dailyMetrics, setDailyMetrics] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get today's date key (YYYY-MM-DD)
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  // Watch daily activity for today
  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(
      query(
        collection(db, "dailyActivities"),
        where("userId", "==", userId),
        where("dateKey", "==", today),
        limit(1)
      ),
      (snap) => {
        if (snap.docs.length > 0) {
          setDailyActivity(snap.docs[0].data());
        } else {
          // Empty day - no activities yet
          setDailyActivity({
            userId,
            dateKey: today,
            completedCount: 0,
            totalCount: 8,
            items: {},
            progressPercent: 0,
          });
        }
      },
      (err) => {
        console.error("Error watching daily activity:", err);
        setError(err.message);
      }
    );

    return unsub;
  }, [userId, today]);

  // Watch daily metrics (last 30 days)
  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(
      query(
        collection(db, "dailyMetrics"),
        where("userId", "==", userId),
        orderBy("date", "desc"),
        limit(30)
      ),
      (snap) => {
        const metrics = snap.docs.map((doc) => doc.data());
        setDailyMetrics(metrics);
      },
      (err) => {
        console.error("Error watching daily metrics:", err);
      }
    );

    return unsub;
  }, [userId]);

  // Watch latest assessment
  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(
      query(
        collection(db, "assessments"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(1)
      ),
      (snap) => {
        if (snap.docs.length > 0) {
          setAssessments([snap.docs[0].data()]);
        } else {
          setAssessments([]);
        }
      },
      (err) => {
        console.error("Error watching assessments:", err);
      }
    );

    return unsub;
  }, [userId]);

  // Watch attendance
  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(
      query(
        collection(db, "attendance"),
        where("userId", "==", userId)
      ),
      (snap) => {
        const rows = snap.docs.map((doc) => doc.data());
        setAttendance(rows);
      },
      (err) => {
        console.error("Error watching attendance:", err);
      }
    );

    return unsub;
  }, [userId]);

  // Calculate scores
  const scores = useMemo(() => {
    if (!dailyActivity) {
      return {
        activity: 0,
        consistency: 0,
        mental: 0,
        attendance: 0,
        xp: 0,
        level: "Beginner",
      };
    }

    const activity = calculateActivityScore(dailyActivity);
    const consistency = calculateConsistencyScore(dailyMetrics);
    const mental = calculateMentalScore(assessments[0]?.score || 0);
    const attendanceScore = calculateAttendanceScore(attendance);
    
    const xp = calculateXP({
      activity,
      consistency,
      attendance: attendanceScore,
      streak: dailyMetrics[0]?.streak || 0,
    });

    const levelData = getLevelFromXP(xp);

    return {
      activity: clamp(activity),
      consistency: clamp(consistency),
      mental: clamp(mental),
      attendance: clamp(attendanceScore),
      xp: Math.floor(xp),
      ...levelData,
    };
  }, [dailyActivity, dailyMetrics, assessments, attendance]);

  // Set loading state
  useEffect(() => {
    if (dailyActivity !== null && dailyMetrics.length >= 0) {
      setLoading(false);
    }
  }, [dailyActivity, dailyMetrics]);

  return {
    ...scores,
    loading,
    error,
    scores,
    statuses: {
      activity: getScoreStatus(scores.activity),
      consistency: getScoreStatus(scores.consistency),
      mental: getScoreStatus(scores.mental),
      attendance: getScoreStatus(scores.attendance),
    },
  };
}
