import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  endOfMonth,
  format,
  isWithinInterval,
  startOfMonth,
  subMonths,
} from "date-fns";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Order } from "../lib/types";
import { type OrderStatus, STATUS_LABELS } from "../lib/types";

interface AnalyticsPageProps {
  orders: Order[];
}

const CHART_COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#14b8a6", // teal
];

export function AnalyticsPage({ orders }: AnalyticsPageProps) {
  // Monthly spending - last 12 months
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = subMonths(now, 11 - i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const monthOrders = orders.filter((o) => {
        if (!o.purchaseDate) return false;
        try {
          return isWithinInterval(new Date(o.purchaseDate), { start, end });
        } catch {
          return false;
        }
      });
      const total = monthOrders.reduce((s, o) => s + o.finalAmount, 0);
      return {
        month: format(monthDate, "MMM yy"),
        spent: Number(total.toFixed(2)),
        orders: monthOrders.length,
      };
    });
  }, [orders]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      map[o.category] = (map[o.category] ?? 0) + o.finalAmount;
    }
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [orders]);

  // Status distribution
  const statusData = useMemo(() => {
    const map: Partial<Record<string, number>> = {};
    for (const o of orders) {
      map[o.status] = (map[o.status] ?? 0) + 1;
    }
    return Object.entries(map)
      .map(([status, count]) => ({
        status: STATUS_LABELS[status as OrderStatus] ?? status,
        count: count ?? 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  // Summary stats -- only count active expense statuses
  const EXPENSE_STATUSES = [
    "Ordered",
    "Shipped",
    "OutForDelivery",
    "Received",
    "Replaced",
  ];
  const expenseOrders = orders.filter((o) =>
    EXPENSE_STATUSES.includes(o.status),
  );
  const totalSpent = expenseOrders.reduce((s, o) => s + o.finalAmount, 0);
  const avgOrderValue =
    expenseOrders.length > 0 ? totalSpent / expenseOrders.length : 0;
  const topCategory = categoryData[0]?.name ?? "—";
  const topPlatform = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders)
      map[o.platformName] = (map[o.platformName] ?? 0) + 1;
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [orders]);

  const EmptyChart = () => (
    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
      <p className="text-sm font-medium">No data yet</p>
      <p className="text-xs mt-1">Add orders to see analytics</p>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-display text-xl font-bold text-foreground">
          Analytics
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Spending insights and order trends
        </p>
      </motion.div>

      {/* Summary row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Total Spent", value: `₹${totalSpent.toFixed(2)}` },
          { label: "Total Orders", value: orders.length },
          { label: "Avg Order Value", value: `₹${avgOrderValue.toFixed(2)}` },
          { label: "Top Platform", value: topPlatform },
          // { label: "Top Category", value: topCategory },
        ].map((s) => (
          <Card key={s.label} className="shadow-card text-center py-4">
            <p className="text-2xl font-bold font-display text-primary">
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
        <Card className="shadow-card text-center py-4">
          <p className="text-2xl font-bold font-display text-primary">
            {topCategory}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Top Category</p>
        </Card>
      </motion.div>

      {/* Monthly spending chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-card" data-ocid="analytics.monthly_chart">
          <CardHeader>
            <CardTitle className="font-display text-base font-semibold">
              Monthly Spending
            </CardTitle>
            <CardDescription>
              Amount spent per month over the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "oklch(0.52 0.04 264)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.52 0.04 264)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `₹${value.toFixed(2)}`,
                      "Spent",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid oklch(0.9 0.02 264)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="spent"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card
            className="shadow-card h-full"
            data-ocid="analytics.category_chart"
          >
            <CardHeader>
              <CardTitle className="font-display text-base font-semibold">
                Category Breakdown
              </CardTitle>
              <CardDescription>Total spend by product category</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <EmptyChart />
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cat-${entry.name}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `₹${value.toFixed(2)}`,
                          "Spent",
                        ]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid oklch(0.9 0.02 264)",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {categoryData.slice(0, 6).map((c, i) => (
                      <div
                        key={c.name}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                        <span className="text-muted-foreground truncate">
                          {c.name}
                        </span>
                        <span className="ml-auto font-semibold text-foreground flex-shrink-0">
                          ₹{c.value.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Status distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            className="shadow-card h-full"
            data-ocid="analytics.status_chart"
          >
            <CardHeader>
              <CardTitle className="font-display text-base font-semibold">
                Status Distribution
              </CardTitle>
              <CardDescription>
                Number of orders by current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={statusData}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      className="stroke-border"
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "oklch(0.52 0.04 264)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="status"
                      type="category"
                      tick={{ fontSize: 10, fill: "oklch(0.52 0.04 264)" }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, "Orders"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid oklch(0.9 0.02 264)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                      {statusData.map((entry, i) => (
                        <Cell
                          key={`status-${entry.status}`}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
