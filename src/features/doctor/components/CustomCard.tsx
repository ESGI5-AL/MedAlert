import { TrendingUp } from "lucide-react";
import type { IPropsCustomCard } from "../types/doctor.types";

export const CustomCard: React.FC<IPropsCustomCard> = ({
  label,
  value,
  icon,
  trend,
  trendColor,
  loading,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
        ) : (
          <span className="text-3xl font-bold text-gray-900">{value}</span>
        )}
        <p
          className={`text-xs font-medium mt-1 ${trendColor} flex items-center gap-1`}
        >
          <TrendingUp className="h-3 w-3" /> {trend}
        </p>
      </div>
    </div>
  );
};
