import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock,
  IndianRupee,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import type { AppPage, Order, User } from "../lib/types";

interface DashboardPageProps {
  orders: Order[];
  user: User;
  onNavigate: (page: AppPage, id?: string) => void;
}

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };
  return `${symbols[currency] ?? `${currency} `}${amount.toFixed(2)}`;
}

function safeDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "MMM dd, yyyy");
  } catch {
    return dateStr;
  }
}

export function DashboardPage({
  orders,
  user,
  onNavigate,
}: DashboardPageProps) {
  const EXPENSE_STATUSES: Order["status"][] = [
    "Ordered",
    "Shipped",
    "OutForDelivery",
    "Received",
    "Replaced",
  ];
  const EXCLUDED_STATUSES: Order["status"][] = [
    "Cancelled",
    "Returned",
    "Refunded",
  ];

  const totalSpent = orders
    .filter((o) => EXPENSE_STATUSES.includes(o.status))
    .reduce((s, o) => s + o.finalAmount, 0);

  const excludedAmount = orders
    .filter((o) => EXCLUDED_STATUSES.includes(o.status))
    .reduce((s, o) => s + o.finalAmount, 0);

  const received = orders.filter((o) => o.status === "Received").length;
  const cancelled = orders.filter((o) => o.status === "Cancelled").length;
  const replaced = orders.filter((o) => o.status === "Replaced").length;
  const pending = orders.filter(
    (o) =>
      o.status === "Ordered" ||
      o.status === "Shipped" ||
      o.status === "OutForDelivery",
  ).length;

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: <ShoppingBag className="h-5 w-5 text-primary" />,
      iconBg: "bg-primary/10",
      ocid: "dashboard.stat.total_orders_card",
    },
    {
      title: "Total Expenses",
      value: `₹${totalSpent.toFixed(2)}`,
      subtitle: "Ordered · Shipped · Delivered · Received · Replaced",
      icon: (
        <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      ),
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      ocid: "dashboard.stat.total_spent_card",
    },
    {
      title: "Cancelled / Returned / Refunded",
      value: `₹${excludedAmount.toFixed(2)}`,
      subtitle: "Not counted in expenses",
      icon: <Ban className="h-5 w-5 text-red-500" />,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      ocid: "dashboard.stat.excluded_amount_card",
    },
    {
      title: "Received",
      value: received,
      icon: (
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      ),
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      ocid: "dashboard.stat.received_card",
    },
    {
      title: "Cancelled",
      value: cancelled,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      ocid: "dashboard.stat.cancelled_card",
    },
    {
      title: "Replaced",
      value: replaced,
      icon: <RefreshCw className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
      iconBg: "bg-teal-100 dark:bg-teal-900/30",
      ocid: "dashboard.stat.replaced_card",
    },
    {
      title: "Pending",
      value: pending,
      icon: <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      ocid: "dashboard.stat.pending_card",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Good day, {user.name.split(" ")[0]}! 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Here's a summary of your shopping activity.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => onNavigate("orders-new")}
          className="flex-shrink-0 gap-1.5"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Add Order
        </Button>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="col-span-1"
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              subtitle={"subtitle" in stat ? stat.subtitle : undefined}
              icon={stat.icon}
              iconBg={stat.iconBg}
              data-ocid={stat.ocid}
            />
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="font-display text-base font-semibold">
              Recent Orders
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("orders")}
              className="text-primary gap-1 h-7 text-xs"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div
                data-ocid="dashboard.recent_orders_table"
                className="flex flex-col items-center justify-center py-12 text-muted-foreground"
              >
                <ShoppingBag className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No orders yet</p>
                <p className="text-xs mt-1">
                  Add your first order to get started
                </p>
              </div>
            ) : (
              <div
                className="overflow-x-auto"
                data-ocid="dashboard.recent_orders_table"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-xs font-semibold uppercase tracking-wide">
                        Product
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide">
                        Platform
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">
                        Amount
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wide">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order, i) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onNavigate("orders-detail", order.id)}
                        data-ocid={`orders.item.${i + 1}`}
                      >
                        <TableCell className="font-medium text-sm">
                          <div className="max-w-[200px]">
                            <p className="truncate">{order.productName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {order.category}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {order.platformName}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          {formatCurrency(order.finalAmount, order.currency)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {safeDate(order.purchaseDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground py-4">
        © {new Date().getFullYear()} Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
