# 📱 Dashboard Components - Visual Reference Guide

## Component Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Welcome Header                                              │
│  "Welcome back, [Name] 👋"                                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬─────────────┬─────────────────┐
│                              │             │                 │
│   RISK SCORE CARD            │ ATTENDANCE  │  QUICK ACTIONS  │
│   (2 cols)                   │ CARD        │  (3 buttons)    │
│                              │             │                 │
│  🎯 Circular Progress         │ 📚 82%      │ 📋 Check-in     │
│  Breakdown (4 mini-bars)      │ Classes      │ 📅 Timetable   │
│  Explanation Text             │ Attended     │ 📝 Assessment  │
└──────────────────────────────┴─────────────┴─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  COUNSELOR RECOMMENDATIONS (Full width)                      │
│  ┌─────────────────┬─────────────────┬─────────────────┐   │
│  │ Counselor Card  │ Counselor Card  │ Counselor Card  │   │
│  │ #1 (Highest     │ #2              │ #3              │   │
│  │ Match)          │                 │                 │   │
│  └─────────────────┴─────────────────┴─────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  REWARDS PANEL (Full width)                                  │
│  ┌──────────┬──────────┬──────────┬──────────┐              │
│  │ Level    │ Streak   │ Achieve. │ To Next  │              │
│  │ 🌱 Cons. │ 🔥 7 day │ 🏆 3     │ ⭐ 45%   │              │
│  └──────────┴──────────┴──────────┴──────────┘              │
│  Progress Bar [████████░░] 45% to next level               │
│  Badges: 🔥 🎯 ⭐ ... (scroll)                               │
│  Weekly Goals: Check-in [5/7] | Attendance [4/5] ...       │
│  💙 "You're doing amazing! Keep pushing 💪"                │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│  MENTAL HEALTH   │  MENTAL HEALTH   │  MENTAL HEALTH   │
│  INSIGHTS (3     │  INSIGHTS (3     │  INSIGHTS (3     │
│  cols)           │  cols)           │  cols)           │
│                  │                  │                  │
│  Stress: Mod.🟡  │  Sleep: Fair😴   │  Social: Lim.🤝 │
│  Trending stable │  6.8h avg        │  Consider reach  │
└──────────────────┴──────────────────┴──────────────────┘

┌──────────────────┬──────────────────┐
│  NOTIFICATIONS   │  REAL-TIME CHAT  │
│  PANEL           │  (existing)      │
└──────────────────┴──────────────────┘
```

---

## Component Details

### 1. Risk Score Card
```
┌─────────────────────────────────┐
│  RISK SCORE CARD                │
├─────────────────────────────────┤
│                                 │
│  🎯 Circular Ring (inverted)    │
│     Shows: 42/100 (Low Risk)    │
│                                 │
│  Status: Low Risk 🟢            │
│  Trend: 📈 Improving             │
│  "Your stress is under control" │
│                                 │
│  Breakdown:                     │
│  Academic    [███░] 65%         │
│  Attendance  [██░░] 40%         │
│  Sleep       [████] 75%         │
│  Emotional   [██░░] 45%         │
│                                 │
└─────────────────────────────────┘
```

### 2. Counselor Card
```
┌─────────────────────────────────┐
│  DR. SARAH CHEN                 │
│  Academic Stress & Anxiety  ⭐4.8│
├─────────────────────────────────┤
│                                 │
│  📝 "High academic pressure     │
│      detected"                  │
│                                 │
│  ⏱️  < 2 hours response          │
│  📍 Mon-Wed, 2-6 PM             │
│  🗣️  English, Mandarin           │
│                                 │
│  Available Slots:               │
│  • 2026-03-28 at 2:00 PM        │
│  • 2026-03-29 at 3:30 PM        │
│                                 │
│  [Book Session]                 │
│                                 │
└─────────────────────────────────┘
```

### 3. Rewards Panel
```
┌─────────────────────────────────┐
│  REWARDS & ACHIEVEMENTS         │
├─────────────────────────────────┤
│  Level: 🌱 Consistent (250 pts) │
│  Streak: 🔥 7 days              │
│  Achievements: 🏆 3 earned      │
│  Progress: ⭐ 45% to next level  │
├─────────────────────────────────┤
│  Progress [████████░░░] 45%     │
├─────────────────────────────────┤
│  Your Achievements:             │
│  ┌──────┬──────┬──────┬──────┐ │
│  │ 🔥   │ 🎯   │ ⭐   │ ❌   │ │
│  │ 7Day │ Week │ Attn │ ?    │ │
│  │ Str  │ War  │ Hero │      │ │
│  └──────┴──────┴──────┴──────┘ │
├─────────────────────────────────┤
│  Weekly Goals:                  │
│  ✅ Check-ins      [5/7] ███░   │
│  📚 Attendance     [4/5] ████░  │
│  📅 Timetable     [6/7] ████░   │
│  💪 Exercise      [3/5] ███░░   │
├─────────────────────────────────┤
│  💙 "Keep going, you've got    │
│      this! 💯"                  │
│                                 │
└─────────────────────────────────┘
```

### 4. Attendance Card
```
┌─────────────────────────────────┐
│  📚 ATTENDANCE                  │
│  Target: 75%                    │
├─────────────────────────────────┤
│                                 │
│         ╭─────────╮             │
│        ╱           ╲            │
│       │  82%       │            │
│       │ Attend.    │            │
│        ╲           ╱            │
│         ╰─────────╯             │
│                                 │
│  ┌────────────┬────────────┐    │
│  │ 49         │ 11         │    │
│  │ Attended   │ Missed     │    │
│  └────────────┴────────────┘    │
│                                 │
│  Status: ✅ On Track!           │
│  Progress to Target:            │
│  [████████░░] 109% of target    │
│                                 │
│  💪 Great attendance! Keep      │
│     maintaining this            │
│                                 │
└─────────────────────────────────┘
```

---

## Color Code Reference

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| Low Risk | Green | #10b981 | ✅ Good status |
| Moderate | Yellow | #f59e0b | ⚠️ Needs attention |
| High Risk | Orange | #f97316 | 🔶 Take action |
| Critical | Red | #ef4444 | 🚨 Urgent |
| Primary | Blue | #3b82f6 | 🔵 Main accent |
| Secondary | Purple | #a855f7 | 💜 Alternative |
| Accent | Cyan | #06b6d4 | 🔷 Highlight |

---

## Animation States

### Hover Effects
- Cards: Scale `1.05` + shadow increase
- Buttons: Scale `1.05` on hover, `0.95` on click
- Text: Color transition smooth
- Icons: Rotate or bounce

### Entry Animations
- Fade in + slide up (`opacity: 0` → `1`, `y: 20` → `0`)
- Stagger on lists (delay: `index * 0.1`)
- Progress fills animated (`duration: 0.8`)

### Transitions
- Default: `300ms ease-out`
- Progress rings: `800ms ease-out`
- Text changes: `200ms smooth`

---

## Responsive Breakpoints

```
Mobile (< 768px)
├─ Risk Score (full width)
├─ Attendance (full width)
├─ Quick Actions (full width)
└─ All 1-column

Tablet (768px - 1024px)
├─ Risk Score (2 cols) | Attendance + Actions (1 col)
├─ Counselors (full width, 3 cols)
├─ Rewards (full width)
└─ Mixed layout

Desktop (> 1024px)
├─ Risk Score (2 cols) | Attendance + Actions (1 col)
├─ Counselors (full width, 3 cols side-by-side)
├─ Rewards (full width with progress)
└─ Optimal spacing & readability
```

---

## Typography Hierarchy

```
Main Heading: 36px, Bold, White
  Welcome back, Alex Johnson 👋

Subheading: 20px, Bold, White
  Risk Score Card

Section Title: 18px, Bold, White/90
  Your Achievements

Label: 14px, Regular, White/70
  Current Mental State

Value: 28px, Bold, White
  82%

Body Text: 14px, Regular, White/90
  Your stress is elevated due to...

Small Text: 12px, Regular, White/60
  Updated 2 hours ago
```

---

## State Indicators

| State | Icon | Color | Meaning |
|-------|------|-------|---------|
| Excellent | 🟢 | Green | All good, continue |
| Good | ✅ | Green | On track |
| Okay | 🟡 | Yellow | Monitor situation |
| Warning | ⚠️ | Orange | Take action |
| Critical | 🚨 | Red | Urgent attention |
| Trending Up | 📈 | Green | Improving |
| Trending Down | 📉 | Red | Worsening |
| Stable | ➡️ | Blue | No change |

---

## Card Styling Standard

All cards follow this pattern:
```
Background:    bg-white/10 (10% white opacity)
Backdrop:      backdrop-blur-xl (blur effect)
Border:        border border-white/20 (subtle outline)
Rounding:      rounded-2xl (extra rounded corners)
Padding:       p-6 (comfortable spacing)
Hover:         y-5 (lift on hover)
Shadow:        shadow-lg (subtle elevation)
Animation:     transition-all duration-300 (smooth)
```

---

## Quick Reference - Copy Tailwind Classes

```jsx
// Glass Card Base
className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-lg"

// Gradient Button
className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:from-blue-600 hover:to-cyan-600"

// Progress Bar
className="h-2 bg-white/20 rounded-full overflow-hidden"

// Icon Badge
className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"

// Text Color Hierarchy
className="text-white"           // Primary text
className="text-white/90"        // Secondary text
className="text-white/70"        // Tertiary text
className="text-white/60"        // Disabled text
```

---

## Common Gotchas & Solutions

| Issue | Solution |
|-------|----------|
| Text not visible | Use `text-white` not black |
| Buttons not clickable | Check `disabled` state |
| Progress not animating | Ensure `initial` & `animate` props |
| Layout broken on mobile | Check responsive classes (`md:`, `lg:`) |
| Colors look washed out | Increase opacity or use saturated gradients |
| Animations too fast | Increase `duration` prop |
| Cards too close | Add `gap-6` to grid |

---

## Testing Checklist

- [ ] All components render without errors
- [ ] Hover effects work smoothly
- [ ] Mobile layout looks good
- [ ] Text is readable (contrast check)
- [ ] Animations are smooth (no jank)
- [ ] Data displays correctly
- [ ] Buttons are clickable
- [ ] Colors match design
- [ ] Spacing is consistent
- [ ] No layout overflow

---

**This visual guide helps you understand how everything looks together!** 🎨
