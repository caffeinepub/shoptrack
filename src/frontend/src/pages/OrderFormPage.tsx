import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AppPage, Order, OrderStatus } from "../lib/types";
import {
  ALL_STATUSES,
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  PLATFORMS,
  STATUS_LABELS,
} from "../lib/types";

interface OrderFormPageProps {
  orderId?: string;
  existingOrder?: Order;
  onSave: (data: Omit<Order, "id" | "createdAt" | "updatedAt">) => void;
  onUpdate: (data: Order) => void;
  onNavigate: (page: AppPage, id?: string) => void;
}

const DEFAULT_VALUES: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
  productName: "",
  category: "Electronics",
  description: "",
  imageUrl: "",
  purchasePrice: 0,
  discount: 0,
  finalAmount: 0,
  currency: "INR",
  platformName: "Amazon",
  platformLink: "",
  orderId: "",
  invoiceNumber: "",
  paymentMethod: "Card",
  purchaseDate: new Date().toISOString().split("T")[0],
  deliveryDate: "",
  warrantyExpiry: "",
  status: "Ordered",
  address: "",
  trackingId: "",
  courierName: "",
  notes: "",
};

interface FormValues extends Omit<Order, "id" | "createdAt" | "updatedAt"> {
  customCategory?: string;
  customPlatform?: string;
}

function SectionCard({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-sm font-semibold text-primary uppercase tracking-wider">
          {title}
        </CardTitle>
        <Separator />
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  required,
  children,
  full,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "md:col-span-2" : ""}`}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function OrderFormPage({
  orderId,
  existingOrder,
  onSave,
  onUpdate,
  onNavigate,
}: OrderFormPageProps) {
  const isEdit = !!orderId;
  const [saving, setSaving] = useState(false);

  const [values, setValues] = useState<FormValues>(() => {
    if (existingOrder) {
      const isCustomCategory =
        !CATEGORIES.includes(existingOrder.category) &&
        existingOrder.category !== "";
      const isCustomPlatform =
        !PLATFORMS.includes(existingOrder.platformName) &&
        existingOrder.platformName !== "";
      return {
        ...existingOrder,
        category: isCustomCategory ? "Other" : existingOrder.category,
        platformName: isCustomPlatform ? "Other" : existingOrder.platformName,
        customCategory: isCustomCategory ? existingOrder.category : "",
        customPlatform: isCustomPlatform ? existingOrder.platformName : "",
      };
    }
    return { ...DEFAULT_VALUES, customCategory: "", customPlatform: "" };
  });

  // Auto-calculate final amount
  useEffect(() => {
    const final = Math.max(
      0,
      (values.purchasePrice || 0) - (values.discount || 0),
    );
    setValues((prev) => ({ ...prev, finalAmount: final }));
  }, [values.purchasePrice, values.discount]);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!values.productName.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!values.purchaseDate) {
      toast.error("Purchase date is required");
      return;
    }

    setSaving(true);

    try {
      const finalCategory =
        values.category === "Other" && values.customCategory?.trim()
          ? values.customCategory.trim()
          : values.category;

      const finalPlatform =
        values.platformName === "Other" && values.customPlatform?.trim()
          ? values.customPlatform.trim()
          : values.platformName;

      const data: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
        productName: values.productName.trim(),
        category: finalCategory,
        description: values.description,
        imageUrl: values.imageUrl,
        purchasePrice: Number(values.purchasePrice) || 0,
        discount: Number(values.discount) || 0,
        finalAmount: values.finalAmount,
        currency: values.currency,
        platformName: finalPlatform,
        platformLink: values.platformLink,
        orderId: values.orderId,
        invoiceNumber: values.invoiceNumber,
        paymentMethod: values.paymentMethod,
        purchaseDate: values.purchaseDate,
        deliveryDate: values.deliveryDate,
        warrantyExpiry: values.warrantyExpiry,
        status: values.status,
        address: values.address,
        trackingId: values.trackingId,
        courierName: values.courierName,
        notes: values.notes,
      };

      if (isEdit && existingOrder) {
        onUpdate({ ...existingOrder, ...data });
        toast.success("Order updated successfully");
        onNavigate("orders-detail", existingOrder.id);
      } else {
        const saved = onSave(data) as unknown as Order;
        toast.success("Order added successfully");
        onNavigate("orders-detail", (saved as Order).id);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onNavigate("orders")}
          data-ocid="order_form.cancel_button"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            {isEdit ? "Edit Order" : "Add New Order"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isEdit
              ? "Update order details"
              : "Fill in the details to track a new purchase"}
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Information */}
        <SectionCard title="📦 Product Information">
          <Field label="Product Name" required full>
            <Input
              value={values.productName}
              onChange={(e) => set("productName", e.target.value)}
              placeholder="e.g. Sony WH-1000XM5 Headphones"
              data-ocid="order_form.product_name_input"
              required
            />
          </Field>
          <Field label="Category">
            <Select
              value={values.category}
              onValueChange={(v) => set("category", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {values.category === "Other" && (
            <Field label="Custom Category">
              <Input
                value={values.customCategory ?? ""}
                onChange={(e) => set("customCategory", e.target.value)}
                placeholder="e.g. Instruments"
              />
            </Field>
          )}
          <Field label="Description" full>
            <Textarea
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief product description..."
              rows={2}
              className="resize-none"
            />
          </Field>
          <Field label="Product Image URL" full>
            <Input
              type="url"
              value={values.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </Field>
        </SectionCard>

        {/* Purchase Details */}
        <SectionCard title="💰 Purchase Details">
          <Field label="Purchase Price">
            <Input
              type="number"
              min={0}
              step={0.01}
              value={values.purchasePrice || ""}
              onChange={(e) =>
                set("purchasePrice", Number.parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
          </Field>
          <Field label="Discount Amount">
            <Input
              type="number"
              min={0}
              step={0.01}
              value={values.discount || ""}
              onChange={(e) =>
                set("discount", Number.parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
          </Field>
          <Field label="Final Paid Amount">
            <Input
              type="number"
              value={values.finalAmount.toFixed(2)}
              readOnly
              className="bg-muted/50 font-semibold"
            />
          </Field>
          <Field label="Currency">
            <Select
              value={values.currency}
              onValueChange={(v) => set("currency", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </SectionCard>

        {/* Platform Information */}
        <SectionCard title="🛒 Platform Information">
          <Field label="Platform Name">
            <Select
              value={values.platformName}
              onValueChange={(v) => set("platformName", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {values.platformName === "Other" && (
            <Field label="Custom Platform Name">
              <Input
                value={values.customPlatform ?? ""}
                onChange={(e) => set("customPlatform", e.target.value)}
                placeholder="e.g. Temu, SHEIN"
              />
            </Field>
          )}
          <Field label="Platform Website">
            <Input
              type="url"
              value={values.platformLink}
              onChange={(e) => set("platformLink", e.target.value)}
              placeholder="https://amazon.com"
            />
          </Field>
        </SectionCard>

        {/* Order Details */}
        <SectionCard title="📄 Order Details">
          <Field label="Purchase Order ID">
            <Input
              value={values.orderId}
              onChange={(e) => set("orderId", e.target.value)}
              placeholder="e.g. AMZ-2024-98712"
            />
          </Field>
          <Field label="Invoice Number">
            <Input
              value={values.invoiceNumber}
              onChange={(e) => set("invoiceNumber", e.target.value)}
              placeholder="INV-001"
            />
          </Field>
          <Field label="Payment Method">
            <Select
              value={values.paymentMethod}
              onValueChange={(v) => set("paymentMethod", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Purchase Date" required>
            <Input
              type="date"
              value={values.purchaseDate}
              onChange={(e) => set("purchaseDate", e.target.value)}
              required
            />
          </Field>
          <Field label="Expected Delivery Date">
            <Input
              type="date"
              value={values.deliveryDate}
              onChange={(e) => set("deliveryDate", e.target.value)}
            />
          </Field>
          <Field label="Warranty Expiry Date">
            <Input
              type="date"
              value={values.warrantyExpiry}
              onChange={(e) => set("warrantyExpiry", e.target.value)}
            />
          </Field>
        </SectionCard>

        {/* Order Status */}
        <SectionCard title="📦 Order Status">
          <Field label="Current Status" full>
            <Select
              value={values.status}
              onValueChange={(v) => set("status", v as OrderStatus)}
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </SectionCard>

        {/* Delivery Details */}
        <SectionCard title="📍 Delivery Details">
          <Field label="Delivery Address" full>
            <Textarea
              value={values.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Full delivery address..."
              rows={2}
              className="resize-none"
            />
          </Field>
          <Field label="Tracking ID">
            <Input
              value={values.trackingId}
              onChange={(e) => set("trackingId", e.target.value)}
              placeholder="1Z999AA10123456784"
            />
          </Field>
          <Field label="Courier Name">
            <Input
              value={values.courierName}
              onChange={(e) => set("courierName", e.target.value)}
              placeholder="e.g. FedEx, UPS, USPS"
            />
          </Field>
        </SectionCard>

        {/* Notes */}
        <SectionCard title="📝 Notes">
          <Field label="Additional Notes" full>
            <Textarea
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any additional notes about this order..."
              rows={3}
              className="resize-none"
            />
          </Field>
        </SectionCard>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onNavigate(isEdit ? "orders-detail" : "orders", existingOrder?.id)
            }
            data-ocid="order_form.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            data-ocid="order_form.submit_button"
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEdit ? "Update Order" : "Save Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
