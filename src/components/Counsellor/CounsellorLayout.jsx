export function CounsellorLayout({ title = "Counsellor Dashboard", children }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {children}
    </div>
  );
}
