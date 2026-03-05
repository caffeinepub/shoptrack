import { useCallback, useState } from "react";
import {
  addOrder,
  deleteOrder,
  deleteOrders,
  getOrderById,
  getOrders,
  updateOrder,
} from "../lib/storage";
import type { Order } from "../lib/types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(() => getOrders());

  const refresh = useCallback(() => {
    setOrders(getOrders());
  }, []);

  const createOrder = useCallback(
    (data: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const order: Order = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      addOrder(order);
      setOrders(getOrders());
      return order;
    },
    [],
  );

  const editOrder = useCallback((data: Order) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    updateOrder(updated);
    setOrders(getOrders());
    return updated;
  }, []);

  const removeOrder = useCallback((id: string) => {
    deleteOrder(id);
    setOrders(getOrders());
  }, []);

  const removeOrders = useCallback((ids: string[]) => {
    deleteOrders(ids);
    setOrders(getOrders());
  }, []);

  const getById = useCallback((id: string): Order | undefined => {
    return getOrderById(id);
  }, []);

  return {
    orders,
    refresh,
    createOrder,
    editOrder,
    removeOrder,
    removeOrders,
    getById,
  };
}
