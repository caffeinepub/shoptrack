export interface Order {
  id: string;
  productName: string;
  category: string;
  description: string;
  imageUrl: string;
  purchasePrice: number;
  discount: number;
  finalAmount: number;
  currency: string;
  platformName: string;
  platformLink: string;
  orderId: string;
  invoiceNumber: string;
  paymentMethod: string;
  purchaseDate: string;
  deliveryDate: string;
  warrantyExpiry: string;
  status: OrderStatus;
  address: string;
  trackingId: string;
  courierName: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "Ordered"
  | "Shipped"
  | "OutForDelivery"
  | "Received"
  | "Cancelled"
  | "Returned"
  | "Replaced"
  | "Refunded";

export interface User {
  name: string;
  email: string;
}

export type AppPage =
  | "auth"
  | "dashboard"
  | "orders"
  | "orders-new"
  | "orders-edit"
  | "orders-detail"
  | "analytics"
  | "export";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  Ordered: "Ordered",
  Shipped: "Shipped",
  OutForDelivery: "Out for Delivery",
  Received: "Received",
  Cancelled: "Cancelled",
  Returned: "Returned",
  Replaced: "Replaced",
  Refunded: "Refunded",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  Ordered:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  OutForDelivery:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  Received:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  Returned:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  Replaced: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  Refunded: "bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300",
};

export const CURRENCIES = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "SGD",
  "AED",
];

export const PLATFORMS = [
  "Amazon",
  "Flipkart",
  "Meesho",
  "eBay",
  "Etsy",
  "Walmart",
  "Myntra",
  "Nykaa",
  "Other",
];

export const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food",
  "Books",
  "Home & Garden",
  "Beauty",
  "Sports",
  "Toys",
  "Automotive",
  "Health",
  "Other",
];

export const PAYMENT_METHODS = [
  "UPI",
  "Card",
  "COD",
  "Net Banking",
  "Wallet",
  "EMI",
  "Crypto",
];

export const ALL_STATUSES: OrderStatus[] = [
  "Ordered",
  "Shipped",
  "OutForDelivery",
  "Received",
  "Cancelled",
  "Returned",
  "Replaced",
  "Refunded",
];
