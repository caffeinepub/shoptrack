import type { Order, User } from "./types";

const KEYS = {
  USER: "shoptrack_user",
  ORDERS: "shoptrack_orders",
} as const;

// ── User ──────────────────────────────────────────────────────────────────────

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User): void {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export function removeUser(): void {
  localStorage.removeItem(KEYS.USER);
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(KEYS.ORDERS);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function addOrder(order: Order): void {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
}

export function updateOrder(updated: Order): void {
  const orders = getOrders().map((o) => (o.id === updated.id ? updated : o));
  saveOrders(orders);
}

export function deleteOrder(id: string): void {
  saveOrders(getOrders().filter((o) => o.id !== id));
}

export function deleteOrders(ids: string[]): void {
  const idSet = new Set(ids);
  saveOrders(getOrders().filter((o) => !idSet.has(o.id)));
}

// ── Sample Data ───────────────────────────────────────────────────────────────

export function seedSampleData(): void {
  if (getOrders().length > 0) return;

  const now = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
  };

  const sample: Order[] = [
    {
      id: crypto.randomUUID(),
      productName: "Sony WH-1000XM5 Wireless Headphones",
      category: "Electronics",
      description:
        "Industry-leading noise cancellation, 30hr battery, multipoint connection",
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      purchasePrice: 329.99,
      discount: 30,
      finalAmount: 299.99,
      currency: "INR",
      platformName: "Amazon",
      platformLink: "https://amazon.com",
      orderId: "AMZ-2024-98712",
      invoiceNumber: "INV-2024-001",
      paymentMethod: "Card",
      purchaseDate: daysAgo(15),
      deliveryDate: daysAgo(10),
      warrantyExpiry: daysAgo(-365),
      status: "Received",
      address: "42 Elm Street, San Francisco, CA 94102",
      trackingId: "1Z999AA10123456784",
      courierName: "UPS",
      notes: "Arrived in perfect condition",
      createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      productName: "The Pragmatic Programmer: 20th Anniversary Edition",
      category: "Books",
      description:
        "Classic software development guide, fully updated for modern practices",
      imageUrl:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
      purchasePrice: 49.99,
      discount: 5,
      finalAmount: 44.99,
      currency: "INR",
      platformName: "Amazon",
      platformLink: "https://amazon.com",
      orderId: "AMZ-2024-65432",
      invoiceNumber: "INV-2024-002",
      paymentMethod: "UPI",
      purchaseDate: daysAgo(8),
      deliveryDate: daysAgo(-2),
      warrantyExpiry: "",
      status: "Shipped",
      address: "42 Elm Street, San Francisco, CA 94102",
      trackingId: "9400111899223326734",
      courierName: "FedEx",
      notes: "",
      createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      productName: "Nike Air Zoom Pegasus 40 Running Shoes",
      category: "Sports",
      description:
        "Lightweight responsive cushioning for everyday training runs",
      imageUrl:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      purchasePrice: 130,
      discount: 20,
      finalAmount: 110,
      currency: "INR",
      platformName: "Flipkart",
      platformLink: "https://flipkart.com",
      orderId: "FK-2024-33219",
      invoiceNumber: "INV-2024-003",
      paymentMethod: "Net Banking",
      purchaseDate: daysAgo(3),
      deliveryDate: "",
      warrantyExpiry: "",
      status: "Ordered",
      address: "15 Marina Blvd, Mumbai 400001",
      trackingId: "",
      courierName: "Bluedart",
      notes: "Size US 11, Color: Black/White",
      createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      productName: "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
      category: "Home & Garden",
      description:
        "6 Qt, pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker",
      imageUrl:
        "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400",
      purchasePrice: 99.95,
      discount: 0,
      finalAmount: 99.95,
      currency: "INR",
      platformName: "Walmart",
      platformLink: "https://walmart.com",
      orderId: "WM-2024-11089",
      invoiceNumber: "INV-2024-004",
      paymentMethod: "Card",
      purchaseDate: daysAgo(45),
      deliveryDate: daysAgo(40),
      warrantyExpiry: daysAgo(-320),
      status: "Received",
      address: "7 Oak Avenue, Austin, TX 78701",
      trackingId: "9261290100830587660579",
      courierName: "USPS",
      notes: "Works great for meal prepping",
      createdAt: new Date(now.getTime() - 45 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 40 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      productName: "Levi's 511 Slim Fit Jeans",
      category: "Clothing",
      description:
        "Classic slim fit denim, sits below waist, slim through hip and thigh",
      imageUrl:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
      purchasePrice: 79.5,
      discount: 15,
      finalAmount: 64.5,
      currency: "INR",
      platformName: "eBay",
      platformLink: "https://ebay.com",
      orderId: "EB-2024-77432",
      invoiceNumber: "INV-2024-005",
      paymentMethod: "Wallet",
      purchaseDate: daysAgo(20),
      deliveryDate: daysAgo(15),
      warrantyExpiry: "",
      status: "Returned",
      address: "42 Elm Street, San Francisco, CA 94102",
      trackingId: "9400111899223326789",
      courierName: "USPS",
      notes: "Wrong size delivered, returned for refund",
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
    },
  ];

  saveOrders(sample);
}
