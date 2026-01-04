import React from "react";

interface Props {
  distribution: number[]; // [Bénin, Modéré, Critique]
}

const LegendItem = ({
  color,
  label,
  count,
}: {
  color: string;
  label: string;
  count: number;
}) => (
  <div className="flex items-center justify-between text-sm group cursor-default">
    <div className="flex items-center gap-3">
      <span
        className={`w-3 h-3 rounded-full ${color} ring-2 ring-white shadow-sm`}
      />
      <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </div>
    <span className="font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
      {count}
    </span>
  </div>
);

export const SeverityBarChart: React.FC<Props> = ({ distribution }) => {
  const total = distribution.reduce((a, b) => a + b, 0) || 1;

  const getWidth = (val: number) => (val / total) * 100;

  return (
    <div className="w-full space-y-6 pt-4">
      <div className="relative h-4 w-full rounded-full overflow-hidden bg-gray-100 flex">
        <div
          style={{ width: `${getWidth(distribution[0])}%` }}
          className="h-full bg-emerald-500 transition-all duration-500"
        />

        {distribution[0] > 0 && distribution[1] > 0 && (
          <div
            className="w-1 h-full bg-white absolute"
            style={{ left: `${getWidth(distribution[0])}%` }}
          />
        )}

        <div
          style={{ width: `${getWidth(distribution[1])}%` }}
          className="h-full bg-orange-500 transition-all duration-500"
        />

        {distribution[0] + distribution[1] > 0 && distribution[2] > 0 && (
          <div
            className="w-1 h-full bg-white absolute"
            style={{
              left: `${getWidth(distribution[0]) + getWidth(distribution[1])}%`,
            }}
          />
        )}

        <div
          style={{ width: `${getWidth(distribution[2])}%` }}
          className="h-full bg-red-600 transition-all duration-500"
        />
      </div>

      <div className="space-y-3">
        <LegendItem
          color="bg-emerald-500"
          label="Bénin (1-4)"
          count={distribution[0]}
        />
        <LegendItem
          color="bg-orange-500"
          label="Modéré (5-7)"
          count={distribution[1]}
        />
        <LegendItem
          color="bg-red-600"
          label="Critique (8-10)"
          count={distribution[2]}
        />
      </div>
    </div>
  );
};
