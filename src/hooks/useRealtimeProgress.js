// ✅ REAL-TIME PROGRESS SYNC HOOK
// Syncs daily activity progress with Firebase in real-time

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * useRealtimeProgress
 * Listens to Firebase for real-time progress updates
 * Also provides method to update progress atomically
 */
export function useRealtimeProgress(userId) {
  const [progress, setProgress] = useState({
    completed: 0,
    total: 8,
    percent: 0,
    lastUpdated: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ REAL-TIME LISTENER
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    console.log("📊 Setting up real-time progress listener for user:", userId);

    const userRef = doc(db, "users", userId);
    const unsub = onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) {
          console.log("⚠️ User document not found, using defaults");
          setProgress({
            completed: 0,
            total: 8,
            percent: 0,
            lastUpdated: null,
          });
          setLoading(false);
          return;
        }

        const data = snap.data();
        const dailyProgress = data?.dailyProgress || {
          completed: 0,
          total: 8,
          percent: 0,
        };

        console.log("✅ Real-time progress updated:", dailyProgress);

        setProgress({
          ...dailyProgress,
          lastUpdated: new Date().toISOString(),
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("❌ Error listening to progress:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      console.log("🧹 Cleaning up progress listener");
      unsub();
    };
  }, [userId]);

  // ✅ UPDATE PROGRESS IN FIREBASE
  const updateProgress = async (completed, total = 8) => {
    if (!userId) {
      console.error("❌ Cannot update progress: no userId");
      return;
    }

    try {
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      console.log(`📈 Updating progress: ${completed}/${total} (${percent}%)`);

      await setDoc(
        doc(db, "users", userId),
        {
          dailyProgress: {
            completed,
            total,
            percent,
            updatedAt: new Date().toISOString(),
          },
        },
        { merge: true }
      );

      console.log("✅ Progress saved to Firebase");
    } catch (err) {
      console.error("❌ Failed to update progress:", err);
      setError(err.message);
    }
  };

  return {
    progress,
    loading,
    error,
    updateProgress,
  };
}

/**
 * Standalone function to update progress (no hook needed)
 * Useful for one-off updates outside of components
 */
export async function updateUserProgress(userId, completed, total = 8) {
  try {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    await setDoc(
      doc(db, "users", userId),
      {
        dailyProgress: {
          completed,
          total,
          percent,
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    console.log(`✅ Progress updated: ${completed}/${total} (${percent}%)`);
  } catch (err) {
    console.error("❌ Failed to update progress:", err);
    throw err;
  }
}

/**
 * Increment completed count by 1
 */
export async function incrementProgress(userId, total = 8) {
  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    const current = snap.data()?.dailyProgress?.completed || 0;
    const newCompleted = Math.min(current + 1, total);

    await updateUserProgress(userId, newCompleted, total);
    return newCompleted;
  } catch (err) {
    console.error("❌ Failed to increment progress:", err);
    throw err;
  }
}

// Import getDoc for incrementProgress
import { getDoc } from "firebase/firestore";
