export function calculateRewardPoints(activity = {}) {
  return Object.values(activity).reduce((acc, value) => acc + (value === true ? 10 : 0), 0);
}

export function getRewardTier(points = 0) {
  if (points >= 500) return "Gold";
  if (points >= 250) return "Silver";
  return "Bronze";
}

export function nextTierThreshold(points = 0) {
  if (points < 250) return 250 - points;
  if (points < 500) return 500 - points;
  return 0;
}
