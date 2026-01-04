import { SearchX } from "lucide-react";

export const EmptyState: React.FC<{ title: string; message: string }> = ({
  title,
  message,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        <SearchX className="h-8 w-8 text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>
    </div>
  );
};
