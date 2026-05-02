import { Activity, BadgeCheck, CalendarClock, MessageSquare, Users } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";
import ProfileProgress from "./ProfileProgress";
import ProfileForm from "./ProfileForm";
import ProfileStats from "./ProfileStats";
import SettingsPanel from "./SettingsPanel";
import StudentListPanel from "./StudentListPanel";

export default function CounsellorProfile({
  profile,
  profileProgress,
  errors,
  onChange,
  onSave,
  saving,
  assignedStudents,
  appointments,
  chats,
  latestAssessmentMap,
  darkMode,
  notificationPreferences,
  passwordForm,
  onToggleDarkMode,
  onTogglePreference,
  onPasswordChange,
  onPasswordSave,
  savingPassword,
}) {
  const counsellorFieldGroups = [
    [
      { name: "name", label: "Name", placeholder: "Professional display name" },
      { name: "email", label: "Email", type: "email", placeholder: "Primary email" },
      { name: "phone", label: "Phone", placeholder: "Contact number" },
      { name: "specialization", label: "Specialization", placeholder: "Clinical focus area" },
      { name: "experience", label: "Experience", placeholder: "Years of experience" },
      { name: "contactInfo", label: "Contact info", placeholder: "Professional contact details" },
      { name: "certifications", label: "Certifications", placeholder: "Licenses or certifications" },
      { name: "workingDays", label: "Working days", placeholder: "Mon, Tue, Wed..." },
      { name: "timeSlots", label: "Time slots", placeholder: "10:00 AM - 4:00 PM" },
      {
        name: "bio",
        label: "Bio",
        multiline: true,
        placeholder: "Professional introduction for students",
      },
    ],
  ];

  const sessionsCompleted = appointments.filter((appointment) => appointment.status === "accepted").length;
  const pendingRequests = appointments.filter((appointment) => appointment.status === "pending").length;
  const activeChats = chats.filter((chat) => chat.isEnabled === true).length;
  const stats = [
    {
      label: "Students handled",
      value: assignedStudents.length,
      icon: <Users className="h-5 w-5 text-sky-500" />,
      iconWrapClass: "bg-sky-500/12",
      help: "Students currently assigned or actively supported.",
    },
    {
      label: "Sessions completed",
      value: sessionsCompleted,
      icon: <CalendarClock className="h-5 w-5 text-emerald-500" />,
      iconWrapClass: "bg-emerald-500/12",
      help: "Accepted sessions tracked from realtime bookings.",
    },
    {
      label: "Rating",
      value: profile.rating ? `${profile.rating}/5` : "N/A",
      icon: <BadgeCheck className="h-5 w-5 text-violet-500" />,
      iconWrapClass: "bg-violet-500/12",
      help: "Realtime rating can be connected later when feedback is available.",
    },
    {
      label: "Active chats",
      value: activeChats,
      icon: <MessageSquare className="h-5 w-5 text-amber-500" />,
      iconWrapClass: "bg-amber-500/12",
      help: `${pendingRequests} pending booking request${pendingRequests === 1 ? "" : "s"} awaiting action.`,
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="space-y-6">
        <ProfileProgress
          completion={profileProgress.completion}
          missingFields={profileProgress.missingFields}
          isReady={profileProgress.isReadyForInteractiveFeatures}
        />

        <ProfileForm
          profile={profile}
          errors={errors}
          onChange={onChange}
          onSave={onSave}
          saving={saving}
          fieldGroups={counsellorFieldGroups}
          title="Professional identity"
          subtitle="Professional Info"
          saveLabel="Save counsellor profile"
        />

        <ProfileStats title="Performance Dashboard" items={stats} glow="from-emerald-500/16 via-sky-500/10 to-violet-500/12" />

        <DashboardCard className="p-6" glow="from-violet-500/14 via-sky-500/10 to-transparent">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
                Professional Details
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Bio and contact clarity</h2>
            </div>
            <div className="rounded-2xl bg-violet-500/12 p-3">
              <BadgeCheck className="h-5 w-5 text-violet-500" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="surface-card rounded-[1.6rem] p-5 md:col-span-2">
              <p className="readable-label text-sm font-medium">Bio</p>
              <p className="mt-3 text-base leading-7 text-[color:var(--text-main)]">{profile.bio || "Add your professional bio to improve trust and clarity for students."}</p>
            </div>
            <div className="surface-card rounded-[1.6rem] p-5">
              <p className="readable-label text-sm font-medium">Certifications</p>
              <p className="mt-3 text-base font-semibold text-[color:var(--text-main)]">{profile.certifications || "Add certifications"}</p>
            </div>
            <div className="surface-card rounded-[1.6rem] p-5">
              <p className="readable-label text-sm font-medium">Contact info</p>
              <p className="mt-3 text-base font-semibold text-[color:var(--text-main)]">{profile.contactInfo || "Add contact details"}</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-6" glow="from-sky-500/16 via-teal-500/12 to-violet-500/12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
                Availability
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Working days and slots</h2>
            </div>
            <div className="rounded-2xl bg-cyan-500/12 p-3">
              <Activity className="h-5 w-5 text-cyan-500" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="surface-card rounded-[1.6rem] p-5">
              <p className="readable-label text-sm font-medium">Working days</p>
              <p className="mt-3 text-xl font-semibold text-[color:var(--text-main)]">{profile.workingDays || "Add your working days"}</p>
            </div>
            <div className="surface-card rounded-[1.6rem] p-5">
              <p className="readable-label text-sm font-medium">Time slots</p>
              <p className="mt-3 text-xl font-semibold text-[color:var(--text-main)]">{profile.timeSlots || "Add your time slots"}</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="space-y-6">
        <StudentListPanel students={assignedStudents} latestAssessmentMap={latestAssessmentMap} />

        <DashboardCard className="p-6" glow="from-amber-500/14 via-sky-500/10 to-transparent">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
                Communication
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Chats and requests</h2>
            </div>
            <div className="rounded-2xl bg-amber-500/12 p-3">
              <MessageSquare className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="surface-card rounded-[1.6rem] p-5">
              <p className="readable-label text-sm font-medium">Pending requests</p>
              <p className="mt-3 text-3xl font-semibold text-[color:var(--text-main)]">{pendingRequests}</p>
              <p className="readable-muted mt-2 text-sm">Session requests waiting for your response.</p>
            </div>
            <div className="surface-card rounded-[1.6rem] p-5">
              <p className="readable-label text-sm font-medium">Active chats</p>
              <p className="mt-3 text-3xl font-semibold text-[color:var(--text-main)]">{activeChats}</p>
              <p className="readable-muted mt-2 text-sm">Secure conversations currently open with students.</p>
            </div>
          </div>
        </DashboardCard>

        <SettingsPanel
          darkMode={darkMode}
          notificationPreferences={notificationPreferences}
          passwordForm={passwordForm}
          onToggleDarkMode={onToggleDarkMode}
          onTogglePreference={onTogglePreference}
          onPasswordChange={onPasswordChange}
          onPasswordSave={onPasswordSave}
          savingPassword={savingPassword}
        />
      </div>
    </div>
  );
}
