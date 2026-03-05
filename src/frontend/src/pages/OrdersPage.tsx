import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "../components/StatusBadge";
import type { AppPage, Order, OrderStatus } from "../lib/types";
import { ALL_STATUSES, CATEGORIES, STATUS_LABELS } from "../lib/types";

const PAGE_SIZE = 10;

interface OrdersPageProps {
  orders: Order[];
  onNavigate: (page: AppPage, id?: string) => void;
  onDelete: (id: string) => Promise<void>;
  onDeleteMany: (ids: string[]) => Promise<void>;
  isLoading?: boolean;
}

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };
  return `${symbols[currency] ?? `${currency} `}${amount.toFixed(2)}`;
}

function safeDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "MMM dd, yyyy");
  } catch {
    return dateStr;
  }
}

export function OrdersPage({
  orders,
  onNavigate,
  onDelete,
  onDeleteMany,
  isLoading = false,
}: OrdersPageProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteBulk, setDeleteBulk] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter & sort
  const filtered = useMemo(() => {
    let result = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.productName.toLowerCase().includes(q) ||
          o.orderId.toLowerCase().includes(q) ||
          o.platformName.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter((o) => o.category === categoryFilter);
    }

    if (fromDate) {
      result = result.filter((o) => o.purchaseDate >= fromDate);
    }
    if (toDate) {
      result = result.filter((o) => o.purchaseDate <= toDate);
    }

    if (minPrice) {
      result = result.filter((o) => o.finalAmount >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter((o) => o.finalAmount <= Number(maxPrice));
    }

    switch (sortBy) {
      case "date-desc":
        result.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
        break;
      case "date-asc":
        result.sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));
        break;
      case "price-desc":
        result.sort((a, b) => b.finalAmount - a.finalAmount);
        break;
      case "price-asc":
        result.sort((a, b) => a.finalAmount - b.finalAmount);
        break;
      case "name":
        result.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case "category":
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
    }

    return result;
  }, [
    orders,
    search,
    statusFilter,
    categoryFilter,
    sortBy,
    fromDate,
    toDate,
    minPrice,
    maxPrice,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const allPageSelected =
    pageOrders.length > 0 && pageOrders.every((o) => selected.has(o.id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      const next = new Set(selected);
      for (const o of pageOrders) next.delete(o.id);
      setSelected(next);
    } else {
      const next = new Set(selected);
      for (const o of pageOrders) next.add(o.id);
      setSelected(next);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      const idToDelete = deleteId;
      setDeleteId(null);
      try {
        await onDelete(idToDelete);
        toast.success("Order deleted");
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(idToDelete);
          return next;
        });
      } catch {
        toast.error("Failed to delete order. Please try again.");
      }
    }
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selected);
    setDeleteBulk(false);
    try {
      await onDeleteMany(ids);
      toast.success(`${ids.length} orders deleted`);
      setSelected(new Set());
    } catch {
      toast.error("Failed to delete orders. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            All Orders
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filtered.length})
            </span>
          </h2>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              data-ocid="orders.bulk_delete_button"
              onClick={() => setDeleteBulk(true)}
              className="gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete {selected.size}
            </Button>
          )}
          <Button
            size="sm"
            data-ocid="orders.add_button"
            onClick={() => onNavigate("orders-new")}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Order
          </Button>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product, order ID, platform..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
                data-ocid="orders.search_input"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                className="w-[160px]"
                data-ocid="orders.status_select"
              >
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-9"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border"
            >
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={(v) => {
                    setCategoryFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">From Date</Label>
                <Input
                  type="date"
                  className="h-8 text-sm"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To Date</Label>
                <Input
                  type="date"
                  className="h-8 text-sm"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Min Price</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-8 text-sm"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Price</Label>
                <Input
                  type="number"
                  placeholder="Any"
                  className="h-8 text-sm"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-0 pt-0" />
        <CardContent className="p-0">
          {isLoading ? (
            <div
              data-ocid="orders.loading_state"
              className="flex flex-col items-center justify-center py-16 text-muted-foreground"
            >
              <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-3" />
              <p className="text-sm">Loading orders...</p>
            </div>
          ) : pageOrders.length === 0 ? (
            <div
              data-ocid="orders.empty_state"
              className="flex flex-col items-center justify-center py-16 text-muted-foreground"
            >
              <ShoppingBag className="h-12 w-12 mb-3 opacity-25" />
              <p className="font-medium text-sm">No orders found</p>
              <p className="text-xs mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto" data-ocid="orders.table">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allPageSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">
                      Product
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">
                      Category
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">
                      Platform
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">
                      Amount
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageOrders.map((order, i) => (
                    <TableRow
                      key={order.id}
                      data-ocid={`orders.item.${(currentPage - 1) * PAGE_SIZE + i + 1}`}
                      className={cn(
                        "transition-colors",
                        selected.has(order.id) && "bg-primary/5",
                      )}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.has(order.id)}
                          onCheckedChange={() => toggleSelect(order.id)}
                          data-ocid={`orders.checkbox.${(currentPage - 1) * PAGE_SIZE + i + 1}`}
                        />
                      </TableCell>
                      <TableCell
                        className="cursor-pointer"
                        onClick={() => onNavigate("orders-detail", order.id)}
                      >
                        <div className="max-w-[180px]">
                          <p className="font-medium text-sm truncate">
                            {order.productName}
                          </p>
                          {order.orderId && (
                            <p className="text-xs text-muted-foreground truncate">
                              #{order.orderId}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.category}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.platformName}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        {formatCurrency(order.finalAmount, order.currency)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {safeDate(order.purchaseDate)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() =>
                              onNavigate("orders-detail", order.id)
                            }
                            data-ocid={`orders.view_button.${(currentPage - 1) * PAGE_SIZE + i + 1}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => onNavigate("orders-edit", order.id)}
                            data-ocid={`orders.edit_button.${(currentPage - 1) * PAGE_SIZE + i + 1}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(order.id)}
                            data-ocid={`orders.delete_button.${(currentPage - 1) * PAGE_SIZE + i + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages} · {filtered.length} orders
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => p - 1)}
              data-ocid="orders.pagination_prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => p + 1)}
              data-ocid="orders.pagination_next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Single Delete Dialog */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this order. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              data-ocid="delete.confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={deleteBulk} onOpenChange={setDeleteBulk}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} Orders?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {selected.size} selected orders. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              data-ocid="delete.confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
