import { useCallback, useEffect, useState } from "react";
import type { Order, OrderStatus } from "../lib/types";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

interface BackendProduct {
  id: string;
  ownerId: string;
  productName: string;
  category: string;
  description: string;
  imageId: string;
  purchasePrice: number;
  discount: number;
  finalAmount: number;
  currency: string;
  platformName: string;
  platformLink: string;
  orderId: string;
  invoiceNumber: string;
  paymentMethod: string;
  purchaseDate: bigint;
  deliveryDate: bigint;
  warrantyExpiry: bigint;
  status: string;
  address: string;
  trackingId: string;
  courierName: string;
  notes: string;
  createdAt: bigint;
  updatedAt: bigint;
}

interface ProductInput {
  productName: string;
  category: string;
  description: string;
  imageId: string;
  purchasePrice: number;
  discount: number;
  currency: string;
  platformName: string;
  platformLink: string;
  orderId: string;
  invoiceNumber: string;
  paymentMethod: string;
  purchaseDate: bigint;
  deliveryDate: bigint;
  warrantyExpiry: bigint;
  status: string;
  address: string;
  trackingId: string;
  courierName: string;
  notes: string;
}

interface ProductFilter {
  search: string;
  statusFilter: string;
  categoryFilter: string;
  minPrice: number;
  maxPrice: number;
  fromDate: bigint;
  toDate: bigint;
  page: bigint;
  pageSize: bigint;
  sortBy: string;
  sortDesc: boolean;
}

interface ProductPage {
  items: BackendProduct[];
  total: bigint;
  page: bigint;
  pageSize: bigint;
}

// Convert backend nanosecond timestamp to YYYY-MM-DD string
function nsToDate(ns: bigint): string {
  if (!ns || ns === 0n) return "";
  try {
    return new Date(Number(ns) / 1_000_000).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

// Convert YYYY-MM-DD string to nanoseconds bigint
function dateToNs(s: string): bigint {
  if (!s) return 0n;
  try {
    const ms = new Date(s).getTime();
    return Number.isNaN(ms) ? 0n : BigInt(ms) * 1_000_000n;
  } catch {
    return 0n;
  }
}

// Convert backend Product to frontend Order
function toOrder(p: BackendProduct): Order {
  return {
    id: p.id,
    productName: p.productName,
    category: p.category,
    description: p.description,
    imageUrl: "",
    purchasePrice: Number(p.purchasePrice),
    discount: Number(p.discount),
    finalAmount: Number(p.finalAmount),
    currency: p.currency,
    platformName: p.platformName,
    platformLink: p.platformLink,
    orderId: p.orderId,
    invoiceNumber: p.invoiceNumber,
    paymentMethod: p.paymentMethod,
    purchaseDate: nsToDate(p.purchaseDate),
    deliveryDate: nsToDate(p.deliveryDate),
    warrantyExpiry: nsToDate(p.warrantyExpiry),
    status: p.status as OrderStatus,
    address: p.address,
    trackingId: p.trackingId,
    courierName: p.courierName,
    notes: p.notes,
    createdAt:
      p.createdAt && p.createdAt !== 0n
        ? new Date(Number(p.createdAt) / 1_000_000).toISOString()
        : new Date().toISOString(),
    updatedAt:
      p.updatedAt && p.updatedAt !== 0n
        ? new Date(Number(p.updatedAt) / 1_000_000).toISOString()
        : new Date().toISOString(),
  };
}

// Convert frontend Order fields to backend ProductInput
function toProductInput(
  data: Omit<Order, "id" | "createdAt" | "updatedAt">,
): ProductInput {
  return {
    productName: data.productName,
    category: data.category,
    description: data.description,
    imageId: "",
    purchasePrice: data.purchasePrice,
    discount: data.discount,
    currency: data.currency,
    platformName: data.platformName,
    platformLink: data.platformLink,
    orderId: data.orderId,
    invoiceNumber: data.invoiceNumber,
    paymentMethod: data.paymentMethod,
    purchaseDate: dateToNs(data.purchaseDate),
    deliveryDate: dateToNs(data.deliveryDate),
    warrantyExpiry: dateToNs(data.warrantyExpiry),
    status: data.status,
    address: data.address,
    trackingId: data.trackingId,
    courierName: data.courierName,
    notes: data.notes,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyActor = any;

export function useOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const refresh = useCallback(async () => {
    if (!actor || isFetching || !isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const filter: ProductFilter = {
        search: "",
        statusFilter: "",
        categoryFilter: "",
        minPrice: 0,
        maxPrice: 0,
        fromDate: 0n,
        toDate: 0n,
        page: 1n,
        pageSize: 1000n,
        sortBy: "date",
        sortDesc: true,
      };
      const page: ProductPage = await (actor as AnyActor).getProducts(filter);
      setOrders(page.items.map(toOrder));
    } catch {
      setError("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [actor, isFetching, isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createOrder = useCallback(
    async (
      data: Omit<Order, "id" | "createdAt" | "updatedAt">,
    ): Promise<Order> => {
      if (!actor) throw new Error("Not connected");
      const input = toProductInput(data);
      const id: string = await (actor as AnyActor).addProduct(input);
      const now = new Date().toISOString();
      const order: Order = { ...data, id, createdAt: now, updatedAt: now };
      await refresh();
      return order;
    },
    [actor, refresh],
  );

  const editOrder = useCallback(
    async (data: Order): Promise<Order> => {
      if (!actor) throw new Error("Not connected");
      const input = toProductInput(data);
      await (actor as AnyActor).updateProduct(data.id, input);
      const updated = { ...data, updatedAt: new Date().toISOString() };
      await refresh();
      return updated;
    },
    [actor, refresh],
  );

  const removeOrder = useCallback(
    async (id: string): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      await (actor as AnyActor).deleteProduct(id);
      await refresh();
    },
    [actor, refresh],
  );

  const removeOrders = useCallback(
    async (ids: string[]): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      await (actor as AnyActor).deleteProducts(ids);
      await refresh();
    },
    [actor, refresh],
  );

  const getById = useCallback(
    (id: string): Order | undefined => {
      return orders.find((o) => o.id === id);
    },
    [orders],
  );

  return {
    orders,
    isLoading,
    error,
    refresh,
    createOrder,
    editOrder,
    removeOrder,
    removeOrders,
    getById,
  };
}
