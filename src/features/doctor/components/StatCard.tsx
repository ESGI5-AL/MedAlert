import React from "react";
import type { IPropsStatCard } from "../types/doctor.types";

export const StatCard: React.FC<IPropsStatCard> = ({
  title,
  value,
  subtitle,
  icon,
  bg,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
    </div>
  );
};
