import { ReactNode } from "react";
import { Card } from "./Card";

interface StatProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: "cyan" | "violet" | "amber";
  trend?: "up" | "down";
}

export function Stat({ label, value, icon, color = "cyan", trend }: StatProps) {
  const iconColors = {
    cyan: "text-cyan-400",
    violet: "text-violet-400",
    amber: "text-amber-400",
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        {icon && (
          <div className={`text-2xl ${iconColors[color]}`}>{icon}</div>
        )}
      </div>
      {trend && (
        <p className={`text-xs mt-2 ${trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
          {trend === "up" ? "↑" : "↓"} {Math.abs(trend === "up" ? 5 : -3)}% vs last month
        </p>
      )}
    </Card>
  );
}
