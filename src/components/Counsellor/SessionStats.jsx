import { CalendarCheck2, CalendarClock, CalendarPlus2, CheckCircle2 } from "lucide-react";
import ProfileStats from "../profile/ProfileStats";

export default function SessionStats({ metrics }) {
  const items = [
    {
      label: "Total Sessions",
      value: metrics.total,
      icon: <CalendarPlus2 className="h-5 w-5 text-sky-500" />,
      iconWrapClass: "bg-sky-500/12",
      help: "All session requests received so far.",
    },
    {
      label: "Pending",
      value: metrics.pending,
      icon: <CalendarClock className="h-5 w-5 text-amber-500" />,
      iconWrapClass: "bg-amber-500/12",
      help: "Requests waiting for your response.",
    },
    {
      label: "Accepted",
      value: metrics.accepted,
      icon: <CalendarCheck2 className="h-5 w-5 text-emerald-500" />,
      iconWrapClass: "bg-emerald-500/12",
      help: "Approved sessions with chat enabled.",
    },
    {
      label: "Completed",
      value: metrics.completed,
      icon: <CheckCircle2 className="h-5 w-5 text-violet-500" />,
      iconWrapClass: "bg-violet-500/12",
      help: "Sessions already marked complete.",
    },
  ];

  return <ProfileStats title="Session Metrics" items={items} glow="from-sky-500/16 via-violet-500/10 to-transparent" />;
}
