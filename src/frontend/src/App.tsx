import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useOrders } from "./hooks/useOrders";
import { seedSampleData } from "./lib/storage";
import type { AppPage } from "./lib/types";

import { AppLayout } from "./components/AppLayout";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ExportPage } from "./pages/ExportPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrderFormPage } from "./pages/OrderFormPage";
import { OrdersPage } from "./pages/OrdersPage";

export default function App() {
  const auth = useAuth();
  const { orders, createOrder, editOrder, removeOrder, removeOrders, getById } =
    useOrders();
  const [page, setPage] = useState<AppPage>("dashboard");
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  // Seed sample data on first login
  useEffect(() => {
    if (auth.user) {
      seedSampleData();
    }
  }, [auth.user]);

  const navigate = (nextPage: AppPage, id?: string) => {
    setPage(nextPage);
    setActiveId(id);
    window.scrollTo(0, 0);
  };

  if (!auth.user) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <AuthPage auth={auth} />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    );
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return (
          <DashboardPage
            orders={orders}
            user={auth.user!}
            onNavigate={navigate}
          />
        );

      case "orders":
        return (
          <OrdersPage
            orders={orders}
            onNavigate={navigate}
            onDelete={removeOrder}
            onDeleteMany={removeOrders}
          />
        );

      case "orders-new":
        return (
          <OrderFormPage
            onSave={(data) => {
              const saved = createOrder(data);
              return saved;
            }}
            onUpdate={editOrder}
            onNavigate={navigate}
          />
        );

      case "orders-edit": {
        const order = activeId ? getById(activeId) : undefined;
        if (!order) {
          navigate("orders");
          return null;
        }
        return (
          <OrderFormPage
            orderId={order.id}
            existingOrder={order}
            onSave={(data) => {
              const saved = createOrder(data);
              return saved;
            }}
            onUpdate={editOrder}
            onNavigate={navigate}
          />
        );
      }

      case "orders-detail": {
        const order = activeId ? getById(activeId) : undefined;
        if (!order) {
          navigate("orders");
          return null;
        }
        return (
          <OrderDetailPage
            order={order}
            onNavigate={navigate}
            onDelete={removeOrder}
          />
        );
      }

      case "analytics":
        return <AnalyticsPage orders={orders} />;

      case "export":
        return <ExportPage orders={orders} user={auth.user!} />;

      default:
        return (
          <DashboardPage
            orders={orders}
            user={auth.user!}
            onNavigate={navigate}
          />
        );
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AppLayout
        user={auth.user}
        currentPage={page}
        onNavigate={navigate}
        onLogout={auth.logout}
      >
        {renderPage()}
      </AppLayout>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
