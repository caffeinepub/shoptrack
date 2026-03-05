import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  PlusCircle,
  ShoppingBag,
  Sun,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import type { AppPage, User } from "../lib/types";

interface NavItem {
  id: AppPage;
  label: string;
  icon: React.ReactNode;
  ocid: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    ocid: "nav.dashboard_link",
  },
  {
    id: "orders",
    label: "Orders",
    icon: <ShoppingBag className="h-4 w-4" />,
    ocid: "nav.orders_link",
  },
  {
    id: "orders-new",
    label: "Add Order",
    icon: <PlusCircle className="h-4 w-4" />,
    ocid: "nav.add_order_link",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    ocid: "nav.analytics_link",
  },
  {
    id: "export",
    label: "Export PDF",
    icon: <FileDown className="h-4 w-4" />,
    ocid: "nav.export_link",
  },
];

interface AppLayoutProps {
  user: User;
  currentPage: AppPage;
  onNavigate: (page: AppPage, id?: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

function SidebarContent({
  currentPage,
  onNavigate,
  user,
  onLogout,
}: {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  user: User;
  onLogout: () => void;
}) {
  const isActive = (id: AppPage) =>
    id === currentPage ||
    (id === "orders" &&
      (currentPage === "orders-detail" || currentPage === "orders-edit"));

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "oklch(var(--sidebar))" }}
    >
      {/* Logo */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-sidebar-foreground">
            ShopTrack
          </span>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-ocid={item.ocid}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
              isActive(item.id)
                ? "bg-sidebar-accent text-white shadow-sm"
                : "text-white/90 hover:text-white hover:bg-sidebar-accent/60",
            )}
          >
            <span
              className={cn(
                isActive(item.id) ? "text-sidebar-primary" : "text-white/80",
              )}
            >
              {item.icon}
            </span>
            {item.label}
            {isActive(item.id) && (
              <motion.div
                layoutId="nav-indicator"
                className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary"
              />
            )}
          </button>
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User section */}
      <div className="px-3 py-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-primary font-semibold text-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-white/70 truncate">{user.email}</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            data-ocid="logout.button"
            onClick={onLogout}
            className="h-8 w-8 flex-shrink-0 text-white/70 hover:text-white hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppLayout({
  user,
  currentPage,
  onNavigate,
  onLogout,
  children,
}: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleNavigate = (page: AppPage) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const pageTitles: Partial<Record<AppPage, string>> = {
    dashboard: "Dashboard",
    orders: "Orders",
    "orders-new": "Add Order",
    "orders-edit": "Edit Order",
    "orders-detail": "Order Details",
    analytics: "Analytics",
    export: "Export Report",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:flex-shrink-0 border-r border-sidebar-border">
        <SidebarContent
          currentPage={currentPage}
          onNavigate={onNavigate}
          user={user}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0 border-sidebar-border">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent
            currentPage={currentPage}
            onNavigate={handleNavigate}
            user={user}
            onLogout={onLogout}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 flex-shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden h-8 w-8"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="font-display text-base font-semibold text-foreground truncate">
              {pageTitles[currentPage] ?? "ShopTrack"}
            </h1>
          </div>

          <Button
            size="icon"
            variant="ghost"
            data-ocid="theme.toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 flex-shrink-0"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
