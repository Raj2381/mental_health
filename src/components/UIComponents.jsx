export function UIButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-lg px-3 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 ${className}`}
    >
      {children}
    </button>
  );
}

export function UIBadge({ children, className = "" }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs bg-slate-100 text-slate-700 ${className}`}>{children}</span>;
}
