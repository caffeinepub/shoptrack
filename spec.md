# ShopTrack

## Current State

The app has a complete Motoko backend (`main.mo`) with full CRUD: `addProduct`, `updateProduct`, `deleteProduct`, `deleteProducts`, `getProduct`, `getProducts`, `getDashboardStats`, `getMonthlySpend`, `getCategoryBreakdown`, `getStatusDistribution`, and `createOrUpdateProfile`.

The frontend currently:
- Uses `localStorage` for all order data via `src/lib/storage.ts`
- Uses a fake email/password auth via `useAuth.ts` (no ICP identity, no backend calls)
- The `useOrders` hook calls localStorage functions only
- Internet Identity infrastructure already exists (`useInternetIdentity.ts`, `useActor.ts`) but is completely unused by the app logic
- Sample data is seeded into localStorage on first login

This means all data is browser-local: save, edit, delete actions reset on page refresh or in another browser.

## Requested Changes (Diff)

### Add
- A `useBackendOrders` hook (or replace `useOrders`) that calls the Motoko backend actor for all CRUD operations: create, update, delete, bulk delete, list with filters
- A `useBackendAuth` hook that uses Internet Identity (via `useInternetIdentity`) for login/logout, and calls `createOrUpdateProfile` + `getMyProfile` on the backend after login
- Loading and error states for all async backend operations (add/edit/delete/load)
- Toast notifications on success and error for save/delete actions

### Modify
- `App.tsx`: replace `useAuth` with the new backend auth hook, replace `useOrders` with the backend orders hook
- `useOrders.ts`: rewrite to call actor methods instead of localStorage
- `useAuth.ts`: rewrite to use Internet Identity login/logout and backend profile
- `AuthPage.tsx`: replace the email/password form with a single "Login with Internet Identity" button (since auth is now ICP-based)
- Remove the `seedSampleData` call from `App.tsx` (no localStorage seeding needed)
- All pages that receive `orders` as a prop should continue working -- the data shape (Order type) stays the same; only the source changes

### Remove
- `src/lib/storage.ts` order functions (or gut them -- keep only if needed for PDF export local cache)
- Fake email/password login logic

## Implementation Plan

1. Rewrite `useAuth.ts` to use `useInternetIdentity` for login/logout and call `actor.createOrUpdateProfile` / `actor.getMyProfile` after login. Expose `user` (name + email from profile), `login`, `logout`, `isInitializing`.
2. Rewrite `useOrders.ts` to call actor methods:
   - `getOrders(filter)` -> `actor.getProducts(filter)` with sensible defaults
   - `createOrder(data)` -> `actor.addProduct(input)` then refresh
   - `editOrder(data)` -> `actor.updateProduct(id, input)` then refresh
   - `removeOrder(id)` -> `actor.deleteProduct(id)` then refresh
   - `removeOrders(ids)` -> `actor.deleteProducts(ids)` then refresh
   - All methods return promises; hook exposes `isLoading`, `error`
3. Update `AuthPage.tsx` to show a "Sign in with Internet Identity" button instead of email/password fields.
4. Update `App.tsx` to use new hooks, remove `seedSampleData`, handle loading states.
5. Map the frontend `Order` type to/from the backend `ProductInput` type (dates as ISO strings in frontend, millisecond timestamps as Int in backend).
6. Ensure all pages (Dashboard, Orders, Analytics, Export) continue to work with the same `Order[]` data shape.
7. Show loading spinners while backend calls are in flight.
8. Show toast on save/delete success and failure.
