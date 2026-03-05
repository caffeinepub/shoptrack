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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  ExternalLink,
  FileText,
  IndianRupee,
  MapPin,
  Package,
  Pencil,
  ShoppingCart,
  StickyNote,
  Trash2,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "../components/StatusBadge";
import type { AppPage, Order } from "../lib/types";

interface OrderDetailPageProps {
  order: Order;
  onNavigate: (page: AppPage, id?: string) => void;
  onDelete: (id: string) => Promise<void>;
}

function safeDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "MMMM dd, yyyy");
  } catch {
    return dateStr;
  }
}

function DetailRow({
  label,
  value,
}: { label: string; value: React.ReactNode }) {
  if (!value || value === "—" || value === "" || value === 0) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2.5 border-b border-border last:border-0">
        <span className="text-xs font-medium text-muted-foreground sm:w-40 flex-shrink-0">
          {label}
        </span>
        <span className="text-sm text-muted-foreground/50">—</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2.5 border-b border-border last:border-0">
      <span className="text-xs font-medium text-muted-foreground sm:w-40 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground flex-1">
        {value}
      </span>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
          <span className="text-primary">{icon}</span>
          {title}
        </CardTitle>
        <Separator />
      </CardHeader>
      <CardContent className="pt-1">{children}</CardContent>
    </Card>
  );
}

export function OrderDetailPage({
  order,
  onNavigate,
  onDelete,
}: OrderDetailPageProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const sym = currencySymbols[order.currency] ?? `${order.currency} `;

  const handleDelete = async () => {
    try {
      await onDelete(order.id);
      toast.success("Order deleted");
      onNavigate("orders");
    } catch {
      toast.error("Failed to delete order. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 flex-wrap"
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0 mt-0.5"
          onClick={() => onNavigate("orders")}
          data-ocid="order_detail.back_button"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl font-bold text-foreground leading-tight">
            {order.productName}
          </h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge status={order.status} />
            <span className="text-xs text-muted-foreground">
              {order.category}
            </span>
            {order.platformName && (
              <span className="text-xs text-muted-foreground">
                · {order.platformName}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("orders-edit", order.id)}
            data-ocid="order_detail.edit_button"
            className="gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            data-ocid="order_detail.delete_button"
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </motion.div>

      {/* Image */}
      {order.imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden shadow-card">
            <img
              src={order.imageUrl}
              alt={order.productName}
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </Card>
        </motion.div>
      )}

      {/* Content grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {/* Product Info */}
        <Section
          icon={<Package className="h-4 w-4" />}
          title="Product Information"
        >
          <DetailRow label="Product Name" value={order.productName} />
          <DetailRow label="Category" value={order.category} />
          <DetailRow label="Description" value={order.description} />
        </Section>

        {/* Purchase Details */}
        <Section
          icon={<IndianRupee className="h-4 w-4" />}
          title="Purchase Details"
        >
          <DetailRow
            label="Purchase Price"
            value={`${sym}${order.purchasePrice.toFixed(2)}`}
          />
          <DetailRow
            label="Discount"
            value={
              order.discount > 0 ? `${sym}${order.discount.toFixed(2)}` : null
            }
          />
          <DetailRow
            label="Final Amount Paid"
            value={
              <span className="text-primary font-bold text-base">
                {sym}
                {order.finalAmount.toFixed(2)} {order.currency}
              </span>
            }
          />
          <DetailRow label="Currency" value={order.currency} />
        </Section>

        {/* Platform */}
        <Section
          icon={<ShoppingCart className="h-4 w-4" />}
          title="Platform Information"
        >
          <DetailRow label="Platform" value={order.platformName} />
          <DetailRow
            label="Website"
            value={
              order.platformLink ? (
                <a
                  href={order.platformLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  {order.platformLink} <ExternalLink className="h-3 w-3" />
                </a>
              ) : null
            }
          />
        </Section>

        {/* Order Details */}
        <Section icon={<FileText className="h-4 w-4" />} title="Order Details">
          <DetailRow label="Order ID" value={order.orderId} />
          <DetailRow label="Invoice Number" value={order.invoiceNumber} />
          <DetailRow
            label="Payment Method"
            value={
              <span className="flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                {order.paymentMethod}
              </span>
            }
          />
          <DetailRow
            label="Purchase Date"
            value={
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {safeDate(order.purchaseDate)}
              </span>
            }
          />
          <DetailRow
            label="Expected Delivery"
            value={safeDate(order.deliveryDate)}
          />
          <DetailRow
            label="Warranty Expiry"
            value={safeDate(order.warrantyExpiry)}
          />
        </Section>

        {/* Delivery */}
        <Section icon={<MapPin className="h-4 w-4" />} title="Delivery Details">
          <DetailRow label="Delivery Address" value={order.address} />
          <DetailRow
            label="Tracking ID"
            value={
              order.trackingId ? (
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    {order.trackingId}
                  </code>
                </span>
              ) : null
            }
          />
          <DetailRow label="Courier" value={order.courierName} />
        </Section>

        {/* Notes */}
        {order.notes && (
          <Section icon={<StickyNote className="h-4 w-4" />} title="Notes">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {order.notes}
            </p>
          </Section>
        )}
      </motion.div>

      {/* Meta */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        Created {safeDate(order.createdAt)} · Updated{" "}
        {safeDate(order.updatedAt)}
      </p>

      {/* Delete Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{order.productName}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              data-ocid="delete.confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
