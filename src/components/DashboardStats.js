import { FolderKanban, CheckCircle2, Clock, AlertTriangle, ListTodo, PlayCircle } from "lucide-react";

export default function DashboardStats({ stats }) {
  const cards = [
    {
      label: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      label: "Total Tasks",
      value: stats?.totalTasks ?? 0,
      icon: ListTodo,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "To Do",
      value: stats?.todoTasks ?? 0,
      icon: Clock,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      label: "In Progress",
      value: stats?.inProgressTasks ?? 0,
      icon: PlayCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Completed",
      value: stats?.doneTasks ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Overdue Tasks",
      value: stats?.overdueTasks?.length ?? 0,
      icon: AlertTriangle,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      highlight: stats?.overdueTasks?.length > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
              card.highlight ? "border-rose-300 bg-rose-50/50" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{card.label}</span>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
