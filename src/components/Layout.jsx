import TopNavbar from "./TopNavbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen text-[color:var(--text-main)]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-violet-400/18 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-teal-400/12 blur-3xl" />
      </div>
      <TopNavbar />
      <main className="relative mx-auto w-full max-w-[1600px] p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}
