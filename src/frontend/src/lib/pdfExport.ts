import { format } from "date-fns";
import type { Order, User } from "./types";
import { STATUS_LABELS } from "./types";

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: "₹",
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
  const typeLabel = {
    daily: "Daily Report",
    monthly: "Monthly Report",
    yearly: "Yearly Report",
    custom: "Custom Date Range Report",
  }[options.reportType];

  const totalSpent = orders.reduce((s, o) => s + o.finalAmount, 0);
  const statusCounts: Partial<Record<string, number>> = {};
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  }

  const genDate = format(new Date(), "MMMM dd, yyyy HH:mm");
  const dateRange = `${safeDate(options.fromDate)} — ${safeDate(options.toDate)}`;

  const rowsHTML = orders
    .map(
      (order, i) => `
    <tr class="${i % 2 === 0 ? "even" : ""}">
      <td>${i + 1}</td>
      <td>${order.productName.length > 40 ? `${order.productName.substring(0, 40)}...` : order.productName}</td>
      <td>${order.category}</td>
      <td>${order.platformName}</td>
      <td><span class="status-badge status-${order.status.toLowerCase()}">${STATUS_LABELS[order.status] ?? order.status}</span></td>
      <td class="amount">${formatCurrency(order.finalAmount, order.currency)}</td>
      <td>${safeDate(order.purchaseDate)}</td>
      <td>${order.orderId || "-"}</td>
    </tr>
  `,
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>ShopTrack Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #222; background: #fff; }
    .header { background: #4f46e5; color: #fff; padding: 18px 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header h1 { font-size: 22px; font-weight: bold; }
    .header .subtitle { font-size: 11px; opacity: 0.85; margin-top: 2px; }
    .header .right { text-align: right; font-size: 11px; opacity: 0.9; }
    .meta { padding: 16px 24px 0; }
    .meta h2 { font-size: 14px; font-weight: bold; color: #333; }
    .meta .range { font-size: 11px; color: #777; margin-top: 3px; }
    .stats { display: flex; gap: 0; margin: 14px 24px; background: #f5f7ff; border: 1px solid #d0d5ee; border-radius: 6px; overflow: hidden; }
    .stat { flex: 1; padding: 12px 16px; border-right: 1px solid #d0d5ee; }
    .stat:last-child { border-right: none; }
    .stat .val { font-size: 18px; font-weight: bold; color: #4f46e5; }
    .stat .lbl { font-size: 10px; color: #888; margin-top: 2px; }
    .table-title { font-size: 12px; font-weight: bold; color: #333; margin: 16px 24px 6px; }
    table { width: calc(100% - 48px); margin: 0 24px; border-collapse: collapse; font-size: 11px; }
    th { background: #4f46e5; color: #fff; padding: 7px 8px; text-align: left; font-weight: 600; }
    td { padding: 6px 8px; border-bottom: 1px solid #eee; }
    tr.even td { background: #f8f9ff; }
    .amount { font-weight: 600; }
    .status-badge { padding: 2px 7px; border-radius: 10px; font-size: 10px; font-weight: 600; }
    .status-received { background: #d1fae5; color: #065f46; }
    .status-shipped { background: #dbeafe; color: #1e40af; }
    .status-ordered { background: #fef3c7; color: #92400e; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .status-returned { background: #ffedd5; color: #9a3412; }
    .status-replaced { background: #ccfbf1; color: #134e4a; }
    .status-refunded { background: #f3f4f6; color: #374151; }
    .status-outfordelivery { background: #ede9fe; color: #5b21b6; }
    .footer { margin: 16px 24px 8px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #999; display: flex; justify-content: space-between; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>ShopTrack</h1>
      <div class="subtitle">Shopping Order Report</div>
    </div>
    <div class="right">
      <div>Generated: ${genDate}</div>
      <div>User: ${options.user.name}${options.user.email ? ` (${options.user.email})` : ""}</div>
    </div>
  </div>
  <div class="meta">
    <h2>${typeLabel}</h2>
    <div class="range">${dateRange}</div>
  </div>
  <div class="stats">
    <div class="stat"><div class="val">${orders.length}</div><div class="lbl">Total Orders</div></div>
    <div class="stat"><div class="val">₹${totalSpent.toFixed(2)}</div><div class="lbl">Total Spent</div></div>
    <div class="stat"><div class="val">${statusCounts.Received ?? 0}</div><div class="lbl">Received</div></div>
    <div class="stat"><div class="val">${statusCounts.Ordered ?? 0}</div><div class="lbl">Pending</div></div>
    <div class="stat"><div class="val">${statusCounts.Cancelled ?? 0}</div><div class="lbl">Cancelled</div></div>
  </div>
  <div class="table-title">Order Details</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product Name</th>
        <th>Category</th>
        <th>Platform</th>
        <th>Status</th>
        <th>Amount</th>
        <th>Purchase Date</th>
        <th>Order ID</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHTML}
    </tbody>
  </table>
  <div class="footer">
    <span>ShopTrack — Shopping Order Tracker</span>
    <span>${genDate}</span>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onafterprint = () => {
      URL.revokeObjectURL(url);
    };
  } else {
    // Fallback: download as HTML
    const a = document.createElement("a");
    a.href = url;
    a.download = `shoptrack-report-${options.reportType}-${format(new Date(), "yyyy-MM-dd")}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
