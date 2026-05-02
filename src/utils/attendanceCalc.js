export function calculateAttendance(attended, total) {
  const a = Number(attended);
  const t = Number(total);
  if (!Number.isFinite(a) || !Number.isFinite(t) || t <= 0) return "0.0";
  return ((a / t) * 100).toFixed(1);
}

export function calculateClassesToAttend(attended, total, targetPercentage, futureClasses = 0) {
  const a = Number(attended);
  const t = Number(total);
  const target = Number(targetPercentage);
  const future = Number(futureClasses || 0);

  if (!Number.isFinite(a) || !Number.isFinite(t) || t <= 0 || !Number.isFinite(target)) {
    return {
      classesNeeded: 0,
      finalPercentage: 0,
      willReachTarget: false,
      message: "Enter valid attendance values.",
    };
  }

  const current = (a / t) * 100;
  if (current >= target && future === 0) {
    return {
      classesNeeded: 0,
      finalPercentage: Number(current.toFixed(1)),
      willReachTarget: true,
      message: `Great work. You are already above ${target}%.`,
    };
  }

  const needed = Math.max(0, Math.ceil((target * t - 100 * a) / (100 - target)));

  if (future > 0) {
    const finalPercentage = ((a + future) / (t + future)) * 100;
    const willReachTarget = finalPercentage >= target;
    return {
      classesNeeded: needed,
      finalPercentage: Number(finalPercentage.toFixed(1)),
      willReachTarget,
      message: willReachTarget
        ? `You can reach the target by attending upcoming classes consistently.`
        : `Even with ${future} future classes, target may not be reached.`,
    };
  }

  return {
    classesNeeded: needed,
    finalPercentage: Number((((a + needed) / (t + needed)) * 100).toFixed(1)),
    willReachTarget: needed > 0,
    message:
      needed === 0
        ? `You are already at or above ${target}%.`
        : `Attend the next ${needed} classes continuously to hit ${target}%.`,
  };
}

export function getAttendanceInsights(attended, total, targetPercentage = 75) {
  const current = Number(calculateAttendance(attended, total));
  const diff = Number((current - Number(targetPercentage)).toFixed(1));
  const status = current >= targetPercentage ? "good" : current >= targetPercentage - 10 ? "warning" : "critical";

  return {
    currentAttendance: current,
    difference: diff,
    status,
    classesToTarget: calculateClassesToAttend(attended, total, targetPercentage),
  };
}

export function calculateSubjectAttendance(subject = {}, targetPercentage = 75) {
  const attended = Number(subject.attendedClasses || 0);
  const total = Number(subject.totalClasses || 0);
  const percentage = Number(calculateAttendance(attended, total));
  const classesToTarget = calculateClassesToAttend(attended, total, targetPercentage);
  const safeToSkip = total > 0
    ? Math.max(0, Math.floor((attended * 100 - Number(targetPercentage) * total) / Number(targetPercentage)))
    : 0;

  return {
    percentage,
    classesNeeded: classesToTarget.classesNeeded,
    safeToSkip,
    status: percentage >= 75 ? "good" : percentage >= 60 ? "warning" : "critical",
  };
}

export function buildAttendanceTrend(attendanceRows = []) {
  const average = attendanceRows.length
    ? attendanceRows.reduce((sum, row) => sum + calculateSubjectAttendance(row).percentage, 0) / attendanceRows.length
    : 0;

  return Array.from({ length: 6 }, (_, index) => ({
    label: `W${index + 1}`,
    attendance: Math.max(0, Math.min(100, Math.round(average - 10 + index * 3 + (index % 2 ? 4 : -1)))),
  }));
}
