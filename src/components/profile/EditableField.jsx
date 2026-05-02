import { Check, Pencil } from "lucide-react";

export default function EditableField({
  label,
  name,
  value,
  type = "text",
  multiline = false,
  editing,
  error,
  onEdit,
  onChange,
  placeholder,
  readOnly = false,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        {!editing && !readOnly ? (
          <button
            type="button"
            onClick={() => onEdit(name)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition hover:bg-slate-700/50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        ) : editing ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            Editing
          </span>
        ) : readOnly ? (
          <span className="text-xs font-semibold text-slate-500">Read-only</span>
        ) : null}
      </div>

      {editing ? (
        multiline ? (
          <textarea
            name={name}
            rows={4}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white px-4 py-3 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white px-4 py-3 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        )
      ) : (
        <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 px-4 py-3 text-sm text-slate-300 min-h-[52px] flex items-center">
          {value || <span className="text-slate-500">{placeholder}</span>}
        </div>
      )}

      {error ? <p className="text-xs font-medium text-red-400">{error}</p> : null}
    </div>
  );
}
