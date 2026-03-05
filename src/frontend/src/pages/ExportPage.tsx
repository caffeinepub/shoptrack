import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "date-fns";
import {
  Calendar,
  FileDown,
  FileText,
  Loader2,
  Settings,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type ExportOptions, exportOrdersToPDF } from "../lib/pdfExport";
import type { Order, User } from "../lib/types";

interface ExportPageProps {
  orders: Order[];
  user: User;
}

type ReportType = "daily" | "monthly" | "yearly" | "custom";

export function ExportPage({ orders, user }: ExportPageProps) {
  const [reportType, setReportType] = useState<ReportType>("monthly");
  const [customFrom, setCustomFrom] = useState(
    format(new Date(), "yyyy-MM-01"),
  );
  const [customTo, setCustomTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM"),
  );
  const [selectedYear, setSelectedYear] = useState(format(new Date(), "yyyy"));
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [generating, setGenerating] = useState(false);

  const getDateRange = (): { from: string; to: string } => {
    const today = new Date();
    switch (reportType) {
      case "daily":
        return {
          from: selectedDate,
          to: selectedDate,
        };
      case "monthly": {
        const [year, month] = selectedMonth.split("-").map(Number);
        const d = new Date(year, month - 1, 1);
        return {
          from: format(startOfMonth(d), "yyyy-MM-dd"),
          to: format(endOfMonth(d), "yyyy-MM-dd"),
        };
      }
      case "yearly": {
        const d = new Date(Number(selectedYear), 0, 1);
        return {
          from: format(startOfYear(d), "yyyy-MM-dd"),
          to: format(endOfYear(d), "yyyy-MM-dd"),
        };
      }
      case "custom":
        return { from: customFrom, to: customTo };
      default:
        return {
          from: format(startOfMonth(today), "yyyy-MM-dd"),
          to: format(endOfMonth(today), "yyyy-MM-dd"),
        };
    }
  };

  const getFilteredOrders = (): Order[] => {
    const { from, to } = getDateRange();
    if (!from || !to) return orders;
    return orders.filter((o) => {
      const d = o.purchaseDate;
      return d >= from && d <= to;
    });
  };

  const handleDownload = async () => {
    const { from, to } = getDateRange();
    const filtered = getFilteredOrders();

    if (filtered.length === 0) {
      toast.error("No orders found in the selected date range");
      return;
    }

    setGenerating(true);
    try {
      const options: ExportOptions = {
        reportType,
        fromDate: from,
        toDate: to,
        user,
      };
      exportOrdersToPDF(filtered, options);
      toast.success(`PDF report downloaded (${filtered.length} orders)`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const filteredCount = getFilteredOrders().length;
  const { from, to } = getDateRange();

  const reportTypes = [
    {
      value: "daily",
      label: "Daily Report",
      icon: <Calendar className="h-4 w-4" />,
      desc: "Orders for a specific day",
    },
    {
      value: "monthly",
      label: "Monthly Report",
      icon: <FileText className="h-4 w-4" />,
      desc: "All orders in a month",
    },
    {
      value: "yearly",
      label: "Yearly Report",
      icon: <TrendingUp className="h-4 w-4" />,
      desc: "Full year summary",
    },
    {
      value: "custom",
      label: "Custom Range",
      icon: <Settings className="h-4 w-4" />,
      desc: "Pick any date range",
    },
  ];

  const years = Array.from({ length: 6 }, (_, i) =>
    String(new Date().getFullYear() - i),
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-display text-xl font-bold text-foreground">
          Export Report
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Download your order history as a formatted PDF report
        </p>
      </motion.div>

      {/* Report Type Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {reportTypes.map((rt) => (
          <button
            key={rt.value}
            type="button"
            onClick={() => setReportType(rt.value as ReportType)}
            className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all duration-150 ${
              reportType === rt.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <span
              className={`mb-2 ${reportType === rt.value ? "text-primary" : "text-muted-foreground"}`}
            >
              {rt.icon}
            </span>
            <p
              className={`text-xs font-semibold ${
                reportType === rt.value ? "text-primary" : "text-foreground"
              }`}
            >
              {rt.label}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
              {rt.desc}
            </p>
          </button>
        ))}
      </motion.div>

      {/* Date Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Configure Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Report Type</Label>
              <Select
                value={reportType}
                onValueChange={(v) => setReportType(v as ReportType)}
              >
                <SelectTrigger data-ocid="export.report_type_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="yearly">Yearly Report</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "daily" && (
              <div className="space-y-1.5">
                <Label className="text-sm">Select Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            )}

            {reportType === "monthly" && (
              <div className="space-y-1.5">
                <Label className="text-sm">Select Month</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            )}

            {reportType === "yearly" && (
              <div className="space-y-1.5">
                <Label className="text-sm">Select Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {reportType === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">From Date</Label>
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">To Date</Label>
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Preview */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Date range:</span>
                <span className="font-medium text-foreground">
                  {from && to ? `${from} → ${to}` : "Not set"}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Orders included:</span>
                <span
                  className={`font-semibold ${filteredCount > 0 ? "text-primary" : "text-muted-foreground"}`}
                >
                  {filteredCount} orders
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Total amount:</span>
                <span className="font-semibold text-foreground">
                  ₹
                  {getFilteredOrders()
                    .reduce((s, o) => s + o.finalAmount, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              onClick={handleDownload}
              disabled={generating || filteredCount === 0}
              data-ocid="export.download_button"
              className="w-full gap-2"
              size="lg"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              {generating ? "Generating PDF..." : "Download PDF Report"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* PDF Preview Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="shadow-card bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary">
              What's included in the PDF?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                "ShopTrack header with app branding",
                "Your name and email",
                "Selected date range",
                "Summary statistics (total orders, spent, status breakdown)",
                "Complete orders table with all details",
                "Generation timestamp",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
