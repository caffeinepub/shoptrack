import { format } from "date-fns";
import jsPDF from "jspdf";
import type { Order, User } from "./types";
import { STATUS_LABELS } from "./types";

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: "Rs.",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "CA$",
    AUD: "A$",
    SGD: "S$",
    AED: "AED ",
  };
  const sym = symbols[currency] ?? `${currency} `;
  return `${sym}${amount.toFixed(2)}`;
}

function safeDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "MMM dd, yyyy");
  } catch {
    return dateStr;
  }
}

export interface ExportOptions {
  reportType: "daily" | "monthly" | "yearly" | "custom";
  fromDate: string;
  toDate: string;
  user: User;
}

export function exportOrdersToPDF(
  orders: Order[],
  options: ExportOptions,
): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;

  // ── Header background ──────────────────────────────────────────────────────
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, pageW, 28, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("ShopTrack", margin, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Shopping Order Report", margin, 19);

  // Right side of header
  doc.setFontSize(9);
  const genDate = `Generated: ${format(new Date(), "MMMM dd, yyyy HH:mm")}`;
  doc.text(genDate, pageW - margin, 12, { align: "right" });
  doc.text(
    `User: ${options.user.name} (${options.user.email})`,
    pageW - margin,
    19,
    { align: "right" },
  );

  // ── Report meta ────────────────────────────────────────────────────────────
  let y = 36;
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  const typeLabel = {
    daily: "Daily Report",
    monthly: "Monthly Report",
    yearly: "Yearly Report",
    custom: "Custom Date Range Report",
  }[options.reportType];
  doc.text(`${typeLabel}`, margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const dateRange = `${safeDate(options.fromDate)} — ${safeDate(options.toDate)}`;
  doc.text(dateRange, margin, y + 6);

  // ── Summary Stats ──────────────────────────────────────────────────────────
  y += 16;
  const totalSpent = orders.reduce((s, o) => s + o.finalAmount, 0);
  const statusCounts: Partial<Record<string, number>> = {};
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  }

  // Summary box
  doc.setFillColor(245, 247, 255);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, "F");
  doc.setDrawColor(200, 205, 240);
  doc.roundedRect(margin, y, contentW, 28, 3, 3, "S");

  const statsXPositions = [
    margin + 15,
    margin + contentW * 0.22,
    margin + contentW * 0.4,
    margin + contentW * 0.57,
    margin + contentW * 0.73,
  ];

  const stats = [
    { label: "Total Orders", value: String(orders.length) },
    {
      label: "Total Spent",
      value: `Rs.${totalSpent.toFixed(2)}`,
    },
    { label: "Received", value: String(statusCounts.Received ?? 0) },
    { label: "Pending", value: String(statusCounts.Ordered ?? 0) },
    { label: "Cancelled", value: String(statusCounts.Cancelled ?? 0) },
  ];

  for (let i = 0; i < stats.length; i++) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text(stats[i].value, statsXPositions[i], y + 13);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 140);
    doc.text(stats[i].label, statsXPositions[i], y + 21);
  }

  // ── Orders Table ───────────────────────────────────────────────────────────
  y += 34;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Order Details", margin, y);
  y += 6;

  // Table header
  const cols = [
    { label: "#", x: margin, w: 10 },
    { label: "Product Name", x: margin + 10, w: 60 },
    { label: "Category", x: margin + 70, w: 30 },
    { label: "Platform", x: margin + 100, w: 28 },
    { label: "Status", x: margin + 128, w: 30 },
    { label: "Amount", x: margin + 158, w: 26 },
    { label: "Purchase Date", x: margin + 184, w: 32 },
    { label: "Order ID", x: margin + 216, w: 35 },
  ];

  const rowH = 8;

  // Header row
  doc.setFillColor(79, 70, 229);
  doc.rect(margin, y, contentW, rowH, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  for (const col of cols) {
    doc.text(col.label, col.x + 2, y + 5.5);
  }
  y += rowH;

  // Data rows
  doc.setFont("helvetica", "normal");
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const isEven = i % 2 === 0;

    if (isEven) {
      doc.setFillColor(248, 249, 255);
      doc.rect(margin, y, contentW, rowH, "F");
    }

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(7.5);

    const rowData = [
      { col: cols[0], text: String(i + 1) },
      {
        col: cols[1],
        text:
          order.productName.length > 30
            ? `${order.productName.substring(0, 30)}...`
            : order.productName,
      },
      { col: cols[2], text: order.category },
      { col: cols[3], text: order.platformName },
      { col: cols[4], text: STATUS_LABELS[order.status] ?? order.status },
      {
        col: cols[5],
        text: formatCurrency(order.finalAmount, order.currency),
      },
      { col: cols[6], text: safeDate(order.purchaseDate) },
      { col: cols[7], text: order.orderId || "-" },
    ];

    for (const { col, text } of rowData) {
      doc.text(text, col.x + 2, y + 5.5);
    }

    y += rowH;

    // Page break
    if (y > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  }

  // Footer line
  y += 5;
  doc.setDrawColor(200, 200, 210);
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 160);
  doc.text(`ShopTrack — Shopping Order Tracker | ${genDate}`, margin, y);
  doc.text("Page 1", pageW - margin, y, { align: "right" });

  // Save
  const fileName = `shoptrack-report-${options.reportType}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}
