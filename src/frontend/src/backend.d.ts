import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ProductFilter {
    categoryFilter: string;
    sortBy: string;
    sortDesc: boolean;
    page: bigint;
    pageSize: bigint;
    search: string;
    maxPrice: number;
    toDate: bigint;
    fromDate: bigint;
    minPrice: number;
    statusFilter: string;
}
export interface ProductInput {
    status: string;
    paymentMethod: string;
    purchasePrice: number;
    purchaseDate: bigint;
    trackingId: string;
    deliveryDate: bigint;
    courierName: string;
    description: string;
    productName: string;
    orderId: string;
    invoiceNumber: string;
    currency: string;
    address: string;
    notes: string;
    warrantyExpiry: bigint;
    discount: number;
    category: string;
    imageId: string;
    platformLink: string;
    platformName: string;
}
export interface Product {
    id: string;
    status: string;
    paymentMethod: string;
    purchasePrice: number;
    finalAmount: number;
    purchaseDate: bigint;
    ownerId: string;
    createdAt: bigint;
    trackingId: string;
    deliveryDate: bigint;
    courierName: string;
    description: string;
    productName: string;
    orderId: string;
    updatedAt: bigint;
    invoiceNumber: string;
    currency: string;
    address: string;
    notes: string;
    warrantyExpiry: bigint;
    discount: number;
    category: string;
    imageId: string;
    platformLink: string;
    platformName: string;
}
export interface MonthlySpend {
    month: string;
    orderCount: bigint;
    totalSpent: number;
}
export interface CategoryBreakdown {
    count: bigint;
    totalSpent: number;
    category: string;
}
export interface StatusDistribution {
    status: string;
    count: bigint;
}
export interface ProductPage {
    total: bigint;
    page: bigint;
    pageSize: bigint;
    items: Array<Product>;
}
export interface DashboardStats {
    pendingCount: bigint;
    cancelledCount: bigint;
    totalOrders: bigint;
    totalSpent: number;
    recentOrders: Array<Product>;
    replacedCount: bigint;
    receivedCount: bigint;
}
export interface UserProfile {
    name: string;
    createdAt: bigint;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(input: ProductInput): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteProduct(id: string): Promise<boolean>;
    deleteProducts(ids: Array<string>): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryBreakdown(): Promise<Array<CategoryBreakdown>>;
    getDashboardStats(): Promise<DashboardStats>;
    getMonthlySpend(): Promise<Array<MonthlySpend>>;
    getProduct(id: string): Promise<Product | null>;
    getProducts(filter: ProductFilter): Promise<ProductPage>;
    getStatusDistribution(): Promise<Array<StatusDistribution>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProduct(id: string, input: ProductInput): Promise<boolean>;
}
