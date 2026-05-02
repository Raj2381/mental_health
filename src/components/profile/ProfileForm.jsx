import { useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Save, CheckCircle } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";
import EditableField from "./EditableField";

export default function ProfileForm({
  profile,
  isCounsellor,
  errors,
  onChange,
  onSave,
  saving,
  fieldGroups,
  title = "Student Identity",
  subtitle = "PERSONAL INFORMATION",
  saveLabel = "Save changes",
}) {
  const [editingFields, setEditingFields] = useState(["name"]);

  const resolvedFieldGroups = useMemo(
    () => [
      [
        { name: "name", label: "Name", placeholder: "Add your full name" },
        { name: "email", label: "Email", type: "email", placeholder: "Add your email", readOnly: true },
      ],
      [
        { name: "registrationId", label: "Registration ID", placeholder: "Your registration/roll number" },
        { name: "phone", label: "Phone", placeholder: "Add your phone number" },
      ],
      [
        { name: "college", label: "College", placeholder: "Your college name" },
        { name: "department", label: "Department", placeholder: "Your department" },
      ],
      [
        { name: "course", label: "Course/Program", placeholder: "Your course or program" },
        { name: "year", label: "Year", placeholder: "1st / 2nd / 3rd / 4th" },
      ],
      [
        { name: "semester", label: "Semester", placeholder: "Current semester" },
        { name: "studentType", label: "Student Type", placeholder: "Full-time / Part-time" },
      ],
      [
        { 
          name: "mentalHealthSummary", 
          label: "Wellness Summary", 
          multiline: true, 
          placeholder: "Optional personal wellness summary" 
        },
      ],
      isCounsellor
        ? [
            { name: "specialization", label: "Specialization", placeholder: "Your focus area" },
            { name: "experience", label: "Experience", placeholder: "Years or summary" },
            { name: "availability", label: "Availability", placeholder: "Your current slots" },
            {
              name: "contactInfo",
              label: "Contact info",
              multiline: true,
              placeholder: "Preferred contact channel and notes",
            },
          ]
        : [],
    ],
    [isCounsellor]
  );
  
  const groups = fieldGroups || resolvedFieldGroups;

  const handleEdit = (fieldName) => {
    setEditingFields((prev) => (prev.includes(fieldName) ? prev : [...prev, fieldName]));
  };

  // Calculate profile completion
  const requiredFields = ["name", "email", "registrationId", "college", "course", "year"];
  const filledFields = requiredFields.filter(field => profile?.[field]);
  const completionPercent = Math.round((filledFields.length / requiredFields.length) * 100);

  return (
    <DashboardCard className="p-6" glow="from-indigo-500/18 via-blue-500/10 to-transparent">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {subtitle}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
        </div>
        <Motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onSave}
          disabled={saving}
          className="animated-gradient rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-60 flex items-center gap-2 hover:shadow-indigo-600/50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : saveLabel}
        </Motion.button>
      </div>

      {/* Profile Completion Bar - Removed */}

      {/* Form Fields Grid */}
      <div className="space-y-6">
        {groups.map((group, groupIdx) => (
          group.length > 0 && (
            <div key={groupIdx} className="grid gap-4 md:grid-cols-2">
              {group.map((field) => (
                <div
                  key={field.name}
                  className={field.multiline ? "md:col-span-2" : ""}
                >
                  <EditableField
                    {...field}
                    value={profile?.[field.name] || ""}
                    editing={editingFields.includes(field.name)}
                    error={errors?.[field.name]}
                    onEdit={handleEdit}
                    onChange={onChange}
                  />
                </div>
              ))}
            </div>
          )
        ))}
      </div>
    </DashboardCard>
  );
}
