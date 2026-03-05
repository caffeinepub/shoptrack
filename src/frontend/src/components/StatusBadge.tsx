import { cn } from "@/lib/utils";
import { type OrderStatus, STATUS_COLORS, STATUS_LABELS } from "../lib/types";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        colorClass,
        className,
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
