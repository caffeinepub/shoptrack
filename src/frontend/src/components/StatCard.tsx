import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  "data-ocid"?: string;
}

export function StatCard({
  title,
  value,
  icon,
  iconBg,
  trend,
  trendUp,
  className,
  "data-ocid": ocid,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-ocid={ocid}
      className={cn(
        "bg-card rounded-xl border border-border p-5 shadow-xs hover:shadow-card-hover transition-shadow duration-200",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-foreground font-display tracking-tight">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trendUp
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-500 dark:text-red-400",
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div className={cn("flex-shrink-0 rounded-xl p-2.5 ml-3", iconBg)}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
