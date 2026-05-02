const CATEGORY_META = {
  academic: { shortLabel: "Study", accent: "from-blue-500 to-indigo-500" },
  sleep: { shortLabel: "Sleep", accent: "from-purple-500 to-violet-500" },
  social: { shortLabel: "Social", accent: "from-emerald-500 to-green-500" },
  emotional: { shortLabel: "Mind", accent: "from-rose-500 to-pink-500" },
};

const HIGH_STRESS_TASKS = {
  sleep: [
    "Sleep before 11PM",
    "No screen 1hr before bed",
    "Evening wind-down routine",
  ],
  academic: [
    "2 focused study sessions",
    "Pomodoro (4 rounds)",
    "Plan tomorrow in 10 mins",
  ],
  emotional: [
    "10-min guided meditation",
    "Journaling for 10 mins",
    "3 deep-breathing breaks",
  ],
  social: [
    "Talk to a friend/family member",
    "Join one peer discussion",
    "Send gratitude message",
  ],
};

const MAINTENANCE_TASKS = {
  sleep: ["Hydrate after waking", "Keep sleep schedule consistent"],
  academic: ["Review top 3 priorities", "One 25-min focus block"],
  emotional: ["2-minute mindful pause", "Write one positive reflection"],
  social: ["Check-in with one classmate", "Short offline social break"],
};

const GENERAL_TASKS = [
  "Drink 2L water",
  "10-min physical movement",
  "Healthy meal planning",
  "No multitasking during study",
];

export function generateTasksFromAssessment(categories = {}) {
  const normalized = {
    academic: Number(categories.academic || 0),
    sleep: Number(categories.sleep || 0),
    social: Number(categories.social || 0),
    emotional: Number(categories.emotional || 0),
  };

  const sortedCategories = Object.entries(normalized).sort((a, b) => b[1] - a[1]);
  const generated = [];
  const pushTasks = (category, labels, limit) => {
    const meta = CATEGORY_META[category];
    labels.slice(0, limit).forEach((label, index) => {
      generated.push({
        key: `${category}-${index}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        category,
        shortLabel: meta.shortLabel,
        accent: meta.accent,
        label,
      });
    });
  };

  sortedCategories.forEach(([category, value]) => {
    if (value > 50) {
      pushTasks(category, HIGH_STRESS_TASKS[category], 2);
    } else if (value > 30) {
      pushTasks(category, HIGH_STRESS_TASKS[category], 1);
      pushTasks(category, MAINTENANCE_TASKS[category], 1);
    } else {
      pushTasks(category, MAINTENANCE_TASKS[category], 1);
    }
  });

  for (let index = 0; index < GENERAL_TASKS.length && generated.length < 8; index += 1) {
    const label = GENERAL_TASKS[index];
    generated.push({
      key: `general-${index}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      category: "general",
      shortLabel: "Daily",
      accent: "from-slate-500 to-slate-600",
      label,
    });
  }

  const seen = new Set();
  const deduped = generated.filter((task) => {
    if (seen.has(task.label)) return false;
    seen.add(task.label);
    return true;
  });

  return deduped.slice(0, 8);
}

export function calculateNewRisk(oldScore, completedPercent) {
  const reduction = Number(completedPercent || 0) * 0.3;
  return Math.max(0, Number(oldScore || 0) - reduction);
}

export function deriveRiskLevel(score) {
  if (score >= 70) return "High";
  if (score >= 40) return "Moderate";
  return "Low";
}

export function getMainIssue(categories = {}) {
  const entries = Object.entries({
    academic: Number(categories.academic || 0),
    sleep: Number(categories.sleep || 0),
    social: Number(categories.social || 0),
    emotional: Number(categories.emotional || 0),
  });

  const top = entries.sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] <= 0) return "General";
  return top[0].charAt(0).toUpperCase() + top[0].slice(1);
}

export function getTrendAndMessage(weeklyStats = []) {
  if (!Array.isArray(weeklyStats) || weeklyStats.length < 2) {
    return { trend: "Stable", message: "Keep your momentum 👍" };
  }

  const sorted = [...weeklyStats].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const prev = Number(sorted[sorted.length - 2]?.score || 0);
  const current = Number(sorted[sorted.length - 1]?.score || 0);

  if (current < prev) return { trend: "Improving", message: "You're improving 👍" };
  if (current > prev) return { trend: "Declining", message: "Take action ⚠️" };
  return { trend: "Stable", message: "Maintain your routine 👍" };
}
