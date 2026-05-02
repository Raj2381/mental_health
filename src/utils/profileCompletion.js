function isFilled(value) {
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
}

export function calculateProfileCompletion(profile = {}) {
  const requiredFields = ["name", "phone", "department", "semester", "college"];
  const filled = requiredFields.filter((field) => isFilled(profile?.[field]));
  const percentage = Math.round((filled.length / requiredFields.length) * 100);
  const isReady = percentage >= 60;
  
  return {
    percentage,
    isReady,
    isReadyForInteractiveFeatures: isReady,
    filledFields: filled.length,
    totalFields: requiredFields.length,
    missingFields: requiredFields.filter((field) => !isFilled(profile?.[field])),
  };
}

export function isProfileReady(profile = {}) {
  const completion = calculateProfileCompletion(profile);
  return completion.isReady;
}
