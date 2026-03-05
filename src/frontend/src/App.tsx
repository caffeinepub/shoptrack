import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useOrders } from "./hooks/useOrders";
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
  const {
    orders,
    createOrder,
    editOrder,
    removeOrder,
    removeOrders,
    getById,
    isLoading,
  } = useOrders();
  const [page, setPage] = useState<AppPage>("dashboard");
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  const navigate = (nextPage: AppPage, id?: string) => {
    setPage(nextPage);
    setActiveId(id);
    window.scrollTo(0, 0);
  };

  // Show spinner while initializing, logging in, or loading profile.
  // Also guard the brief window where isInitializing just flipped false but
  // the profile fetch hasn't resolved yet — prevents the white screen flash.
  if (auth.isInitializing || auth.isLoadingProfile) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <p className="text-sm">Loading ShopTrack...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

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
            isLoading={isLoading}
          />
        );

      case "orders-new":
        return (
          <OrderFormPage
            onSave={createOrder}
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
            onSave={createOrder}
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
