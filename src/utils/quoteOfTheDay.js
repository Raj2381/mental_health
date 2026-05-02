// ✅ QUOTE OF THE DAY - Daily Rotation System
// Same quote for entire day, changes at midnight

const QUOTES = [
  {
    text: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
  },
  {
    text: "Small steps every day lead to big results.",
    author: "Unknown",
  },
  {
    text: "Consistency is more important than perfection.",
    author: "Unknown",
  },
  {
    text: "Your mental health is a priority, not a luxury.",
    author: "Unknown",
  },
  {
    text: "Progress, not perfection.",
    author: "Unknown",
  },
  {
    text: "Discipline creates freedom.",
    author: "Unknown",
  },
  {
    text: "Rest when you're tired, not when you're done.",
    author: "Unknown",
  },
  {
    text: "You are stronger than you think.",
    author: "Unknown",
  },
  {
    text: "One day at a time. One step at a time.",
    author: "Unknown",
  },
  {
    text: "Your wellness journey is unique to you.",
    author: "Unknown",
  },
];

/**
 * Get today's quote from localStorage cache
 * Returns same quote for entire day
 * Automatically refreshes at midnight
 */
export function getTodayQuote() {
  const today = new Date().toDateString(); // e.g., "Mon Apr 09 2026"
  const stored = localStorage.getItem("dashboard_quote");

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Check if cached quote is from today
      if (parsed.date === today) {
        console.log("✅ Quote cached for today:", parsed.quote.text.substring(0, 30) + "...");
        return parsed.quote;
      }
    } catch (e) {
      console.error("Failed to parse cached quote:", e);
    }
  }

  // Get new random quote for today
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  // Cache it with today's date
  localStorage.setItem(
    "dashboard_quote",
    JSON.stringify({
      quote: randomQuote,
      date: today,
    })
  );

  console.log("✅ New quote for today:", randomQuote.text.substring(0, 30) + "...");
  return randomQuote;
}

/**
 * Clear cached quote (for testing or manual refresh)
 */
export function resetQuoteCache() {
  localStorage.removeItem("dashboard_quote");
  console.log("✅ Quote cache cleared");
}

/**
 * Get all available quotes
 */
export function getAllQuotes() {
  return QUOTES;
}

/**
 * Add custom quote to the pool (optional)
 */
export function addCustomQuote(text, author) {
  QUOTES.push({ text, author });
  resetQuoteCache(); // Force refresh on next getTodayQuote()
}
