import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  Brain,
  Heart,
  Users,
  Calendar,
  BarChart2,
  Shield,
  Sparkles,
  TrendingUp,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Smile,
  BookOpen,
  Moon,
  Sun,
  Activity,
  Clock,
} from "lucide-react";

/* ─── DESIGN TOKENS ───────────────────────────────────────── */
const C = {
  sage:    "#6B8F71",
  sageMid: "#4A6E50",
  sagePale:"#EFF5F0",
  sageLight:"#D6E8D9",
  sand:    "#F5F0E8",
  sandDark:"#E8DFD0",
  cream:   "#FDFAF6",
  stone:   "#7A6F63",
  stoneMid:"#5A5048",
  ink:     "#2C2418",
  inkSoft: "#4A3F35",
  muted:   "#8A7F74",
  blush:   "#C9847E",
  blushPale:"#F5ECEA",
  skyBlue: "#7BA7BC",
  skyPale: "#EAF2F6",
  lavender:"#9B8DB5",
  lavPale: "#F0EDF6",
  gold:    "#C4A35A",
  goldPale:"#F7F0E0",
};

/* ─── FONT IMPORT ─────────────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap";
document.head.appendChild(fontLink);

const styles = `
  * { box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; background: ${C.cream}; color: ${C.ink}; }
  .lora { font-family: 'Lora', serif; }
`;
const styleEl = document.createElement("style");
styleEl.textContent = styles;
document.head.appendChild(styleEl);

/* ─── MAIN COMPONENT ──────────────────────────────────────── */
export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── NAVBAR ─────────────────────────────────── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 5%", borderBottom: `1px solid ${C.sandDark}`,
        background: C.cream, position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: C.sage, display: "flex", alignItems: "center",
            justifyContent: "center",
          }}>
            <Heart size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 600, color: C.ink, letterSpacing: "-0.3px" }}>
            Wellness Hub
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link to="/login" style={{
            padding: "8px 18px", borderRadius: 8, border: `1px solid ${C.sandDark}`,
            color: C.inkSoft, fontSize: 14, fontWeight: 500, textDecoration: "none",
            background: "transparent",
          }}>Sign in</Link>
          <Link to="/signup" style={{
            padding: "8px 18px", borderRadius: 8, background: C.sage,
            color: "#fff", fontSize: 14, fontWeight: 500, textDecoration: "none",
          }}>Get started</Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <section style={{ padding: "72px 5% 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>

          {/* LEFT */}
          <Motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px",
              background: C.sagePale, borderRadius: 20, border: `1px solid ${C.sageLight}`,
              fontSize: 12, color: C.sageMid, fontWeight: 500, marginBottom: 20,
            }}>
              <Sparkles size={13} /> AI-powered student support
            </div>

            <h1 className="lora" style={{
              fontSize: "clamp(34px, 4vw, 50px)", lineHeight: 1.2, fontWeight: 600,
              color: C.ink, margin: "0 0 20px",
            }}>
              Your mental health<br />
              <span style={{ color: C.sage }}>matters most.</span>
            </h1>

            <p style={{ fontSize: 17, lineHeight: 1.7, color: C.muted, maxWidth: 440, margin: "0 0 32px" }}>
              A calm space for students to track their wellbeing, speak with counsellors, and build healthier habits — one day at a time.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
              <Link to="/signup" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", background: C.sage, color: "#fff",
                borderRadius: 10, fontSize: 15, fontWeight: 500, textDecoration: "none",
              }}>
                Start free <ArrowRight size={16} />
              </Link>
              <button style={{
                padding: "12px 24px", border: `1px solid ${C.sandDark}`,
                background: "#fff", borderRadius: 10, fontSize: 15,
                color: C.inkSoft, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>
                See how it works
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Anonymous & fully private", "Free for all enrolled students", "Real counsellors, real support"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.stone }}>
                  <CheckCircle size={15} color={C.sage} /> {t}
                </div>
              ))}
            </div>
          </Motion.div>

          {/* RIGHT — Dashboard Mockup */}
          <Motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.15 }}>
            <DashboardMockup />
          </Motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────── */}
      <section style={{ background: C.sand, borderTop: `1px solid ${C.sandDark}`, borderBottom: `1px solid ${C.sandDark}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 5%", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {[
            { n: "12,000+", l: "Students helped" },
            { n: "98%", l: "Feel less stressed" },
            { n: "340+", l: "Counsellors available" },
            { n: "4.9★", l: "Average rating" },
          ].map(({ n, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="lora" style={{ fontSize: 28, fontWeight: 600, color: C.ink }}>{n}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────── */}
      <section style={{ padding: "80px 5%", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 className="lora" style={{ fontSize: 36, fontWeight: 600, color: C.ink, margin: "0 0 12px" }}>
            Built around how students actually feel
          </h2>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 500, margin: "0 auto" }}>
            Not another clinical app. A place that gets the chaos of student life.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          <FeatureCard
            icon={<Brain size={22} color={C.lavender} />}
            bg={C.lavPale}
            title="AI mood assessment"
            desc="Quick check-ins that learn your patterns and flag when you need extra support."
          />
          <FeatureCard
            icon={<MessageCircle size={22} color={C.skyBlue} />}
            bg={C.skyPale}
            title="Live counselling"
            desc="Book a session with certified counsellors in minutes, not weeks."
          />
          <FeatureCard
            icon={<BarChart2 size={22} color={C.sage} />}
            bg={C.sagePale}
            title="Progress tracking"
            desc="See your wellness trends week over week in a simple, honest view."
          />
          <FeatureCard
            icon={<Shield size={22} color={C.blush} />}
            bg={C.blushPale}
            title="Fully anonymous"
            desc="Your data stays private. We never share anything with your institution."
          />
          <FeatureCard
            icon={<Moon size={22} color={C.lavender} />}
            bg={C.lavPale}
            title="Sleep & stress logs"
            desc="Track what affects your mood — sleep, diet, deadlines — all in one place."
          />
          <FeatureCard
            icon={<Calendar size={22} color={C.gold} />}
            bg={C.goldPale}
            title="Smart scheduling"
            desc="Self-care reminders and session booking that fits around your timetable."
          />
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <section style={{ background: C.sand, padding: "80px 5%", borderTop: `1px solid ${C.sandDark}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <Clock size={28} color={C.sage} />
              <h2 className="lora" style={{ fontSize: 36, fontWeight: 600, color: C.ink, margin: 0 }}>
                Getting started takes 2 minutes
              </h2>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, position: "relative" }}>
            {[
              { n: "01", icon: <BookOpen size={18} color={C.sage} />, title: "Create your account", desc: "Sign up anonymously — no student ID needed." },
              { n: "02", icon: <Smile size={18} color={C.skyBlue} />, title: "Complete a check-in", desc: "Answer 5 questions about how you're feeling today." },
              { n: "03", icon: <Sparkles size={18} color={C.lavender} />, title: "Get your insights", desc: "See your personalised wellbeing snapshot instantly." },
              { n: "04", icon: <Users size={18} color={C.blush} />, title: "Connect if needed", desc: "Book a counsellor or join a peer support group." },
            ].map(({ n, icon, title, desc }) => (
              <Motion.div key={n} whileHover={{ y: -4 }} style={{
                background: C.cream, borderRadius: 14, padding: "28px 22px",
                border: `1px solid ${C.sandDark}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: "0.08em", marginBottom: 14 }}>{n}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  {icon}
                  <div style={{ fontSize: 15, fontWeight: 500, color: C.ink }}>{title}</div>
                </div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COUNSELLOR SECTION ─────────────────────── */}
      <section style={{ padding: "80px 5%", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <h2 className="lora" style={{ fontSize: 36, fontWeight: 600, color: C.ink, margin: "0 0 16px", lineHeight: 1.3 }}>
              Real people,<br />real conversations.
            </h2>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, margin: "0 0 24px" }}>
              Our counsellors are trained mental health professionals who specialise in student challenges — exam anxiety, homesickness, burnout, and everything in between.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Available 7 days a week, 8am – 10pm",
                "Video, voice, or text sessions",
                "Matched to your specific concerns",
              ].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.stone }}>
                  <CheckCircle size={16} color={C.sage} /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Counsellor Card Mockup */}
          <CounsellorMockup />
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section style={{ background: C.sagePale, borderTop: `1px solid ${C.sageLight}`, borderBottom: `1px solid ${C.sageLight}`, padding: "72px 5%" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 14 }}>
            <Heart size={32} color={C.sage} />
            <h2 className="lora" style={{ fontSize: 34, fontWeight: 600, color: C.ink, margin: 0 }}>
              You don't have to figure it out alone.
            </h2>
          </div>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, margin: "0 0 28px" }}>
            Join thousands of students who've taken the first step towards better mental health.
          </p>
          <Link to="/signup" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 28px", background: C.sage, color: "#fff",
            borderRadius: 10, fontSize: 16, fontWeight: 500, textDecoration: "none",
          }}>
            Start your free journey <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer style={{ background: C.ink, color: "#fff", padding: "48px 5% 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: C.sage, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Heart size={15} color="#fff" />
                </div>
                <span style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 600 }}>Wellness Hub</span>
              </div>
              <p style={{ fontSize: 13, color: "#9A8E82", lineHeight: 1.7, maxWidth: 220 }}>
                AI-powered mental health support designed for the realities of student life.
              </p>
            </div>
            {[
              { heading: "Product", links: ["Assessment", "Counselling", "Analytics", "Scheduling"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { heading: "Legal", links: ["Privacy", "Terms", "Security", "Accessibility"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <h4 style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" }}>{heading}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {links.map(l => (
                    <li key={l}><a href="#" style={{ fontSize: 13, color: "#9A8E82", textDecoration: "none" }}>{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #3A2E22", paddingTop: 20, fontSize: 12, color: "#6A5E52" }}>
            © 2026 Student Wellness Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── DASHBOARD MOCKUP ───────────────────────────────────── */
function DashboardMockup() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const scores = [65, 72, 58, 80, 74, 88, 76];
  const maxScore = 100;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.3 }}
      style={{
        background: "#fff", borderRadius: 18, border: `1px solid ${C.sandDark}`,
        overflow: "hidden", boxShadow: `0 8px 40px rgba(44,36,24,0.10)`,
      }}
    >
      {/* Header */}
      <div style={{ background: C.sage, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Good morning, Priya</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", fontFamily: "'Lora', serif" }}>Your Wellness Dashboard</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sun size={18} color="#fff" />
        </div>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Mood score */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: C.sagePale, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Mood score today</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.sageMid, fontFamily: "'Lora', serif" }}>76</div>
            <div style={{ fontSize: 11, color: C.sage, display: "flex", alignItems: "center", gap: 3 }}>
              <TrendingUp size={11} /> +8 from yesterday
            </div>
          </div>
          <div style={{ background: C.skyPale, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Streak</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.skyBlue, fontFamily: "'Lora', serif" }}>14</div>
            <div style={{ fontSize: 11, color: C.skyBlue }}>days in a row</div>
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ background: C.sand, borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Weekly mood trend</div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 52 }}>
            {days.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: "100%", height: `${(scores[i] / maxScore) * 48}px`,
                  background: i === 6 ? C.sage : C.sageLight, borderRadius: "4px 4px 0 0",
                  transition: "height 0.4s",
                }} />
                <span style={{ fontSize: 9, color: C.muted }}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming */}
        <div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>Upcoming</div>
          {[
            { icon: <MessageCircle size={13} color={C.skyBlue} />, label: "Session with Dr. Meena", time: "Today 3:00 PM", bg: C.skyPale },
            { icon: <Activity size={13} color={C.sage} />, label: "Mindfulness check-in", time: "Tomorrow 9:00 AM", bg: C.sagePale },
          ].map(({ icon, label, time, bg }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
              background: bg, borderRadius: 9, marginBottom: 6,
            }}>
              {icon}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.ink }}>{label}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{time}</div>
              </div>
              <Clock size={11} color={C.muted} />
            </div>
          ))}
        </div>
      </div>
    </Motion.div>
  );
}

/* ─── COUNSELLOR MOCKUP ──────────────────────────────────── */
function CounsellorMockup() {
  const counsellors = [
    { initials: "DM", name: "Dr. Meena Rao", spec: "Anxiety & Stress", rating: "4.9", avail: "Available now", color: C.sage, bg: C.sagePale },
    { initials: "SR", name: "Suraj Rajan", spec: "Academic Burnout", rating: "4.8", avail: "Available 4 PM", color: C.skyBlue, bg: C.skyPale },
    { initials: "AK", name: "Ananya Krishnan", spec: "Relationships", rating: "4.9", avail: "Available tomorrow", color: C.lavender, bg: C.lavPale },
  ];

  return (
    <Motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        background: "#fff", borderRadius: 18, border: `1px solid ${C.sandDark}`,
        overflow: "hidden", boxShadow: `0 8px 40px rgba(44,36,24,0.08)`,
      }}
    >
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.sandDark}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>Find a counsellor</div>
        <div style={{ fontSize: 11, color: C.muted }}>Matched to your check-in today</div>
      </div>
      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {counsellors.map(({ initials, name, spec, rating, avail, color, bg }) => (
          <div key={name} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px",
            background: bg, borderRadius: 12, border: `1px solid ${color}22`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", background: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0,
            }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{spec}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color }}>★ {rating}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{avail}</div>
            </div>
          </div>
        ))}
        <button style={{
          width: "100%", padding: "11px", background: C.sage, color: "#fff",
          border: "none", borderRadius: 10, fontSize: 13, fontWeight: 500,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 4,
        }}>
          Book a session →
        </button>
      </div>
    </Motion.div>
  );
}

/* ─── FEATURE CARD ───────────────────────────────────────── */
function FeatureCard({ icon, bg, title, desc }) {
  return (
    <Motion.div
      whileHover={{ y: -4 }}
      style={{
        background: bg, borderRadius: 14, padding: "24px",
        border: `1px solid ${C.sandDark}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        {icon}
        <div style={{ fontSize: 15, fontWeight: 500, color: C.ink }}>{title}</div>
      </div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{desc}</div>
    </Motion.div>
  );
}