# ShopTrack

## Current State

ShopTrack is a full-stack order tracking app with:
- A Motoko backend (main.mo) that fully implements CRUD for products/orders, user profiles, analytics (dashboard stats, monthly spend, category breakdown, status distribution)
- A React/TypeScript frontend with pages: Dashboard, Orders list, Order form (add/edit), Order detail, Analytics, Export (PDF)
- Internet Identity authentication via useInternetIdentity hook
- useOrders hook that calls backend methods: addProduct, getProducts, updateProduct, deleteProduct, deleteProducts, getMyProfile, createOrUpdateProfile, getDashboardStats, getMonthlySpend, getCategoryBreakdown, getStatusDistribution

**Root problem**: The `backend.d.ts` file is a minimal stub that does NOT declare any of the product/analytics/profile methods. As a result, at runtime the actor does not have the correct interface and calls fail silently — data appears to save (no error shown) but actually nothing persists to the canister. On refresh, data is gone.

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- Regenerate `backend.d.ts` so it declares all backend methods: `addProduct`, `getProducts`, `updateProduct`, `deleteProduct`, `deleteProducts`, `getProduct`, `getMyProfile`, `createOrUpdateProfile`, `getDashboardStats`, `getMonthlySpend`, `getCategoryBreakdown`, `getStatusDistribution`
- Fix `useOrders.ts` to handle the correct return types from the properly-typed actor (bigint conversions, Option types as arrays, etc.)
- Fix `useAuth.ts` to properly call `getMyProfile` and `createOrUpdateProfile` with correct types
- Fix `App.tsx` or `DashboardPage.tsx` to call `getDashboardStats` from the backend instead of computing from local order array, so analytics also persists correctly

### Remove
- Nothing

## Implementation Plan

1. Regenerate Motoko backend — this will produce a correct `backend.d.ts` with all method signatures
2. Update `useOrders.ts` to use typed actor calls (all existing calls should work once types are correct)
3. Update `useAuth.ts` to use typed actor calls for profile
4. Verify `DashboardPage` and `AnalyticsPage` use data from backend (either via orders or direct backend analytics calls)
5. Typecheck and build to confirm no errors
