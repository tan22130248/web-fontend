# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

**Fashion Marketplace Frontend** — a React single-page application for a fashion e-commerce platform branded **"Tiệm Cũ"**. It supports three user roles (`buyer`, `seller`, `admin`) and talks to a separate Spring-style backend over REST.

The UI is in **Vietnamese**. Keep user-facing copy in Vietnamese; keep code, identifiers, and comments in English.

## Tech Stack

- **React 18** with Create React App (`react-scripts` 5)
- **React Router v6** (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **Tailwind CSS 3** + PostCSS + Autoprefixer
- **Axios** for HTTP
- **React Toastify** for notifications
- **JWT** auth stored in `localStorage`, with OAuth2 (Google, Facebook) redirect flow

There is **no TypeScript**, **no test runner**, and **no linter config** in the repo. Do not introduce them unless asked.

## Scripts

```bash
npm start    # dev server (CRA, port 3000)
npm run build # production build
```

There is no `test` or `lint` script. Do not invent one.

## Environment Variables

Defined in `.env` (committed for local dev). All keys must be prefixed with `REACT_APP_` to be exposed to CRA:

- `REACT_APP_API_URL` — backend base URL (default `http://localhost:8080`)
- `REACT_APP_GOOGLE_CLIENT_ID`, `REACT_APP_FACEBOOK_APP_ID`
- `REACT_APP_GOOGLE_REDIRECT_URI`, `REACT_APP_FACEBOOK_REDIRECT_URI`

Never hardcode the API URL; always read it from `process.env.REACT_APP_API_URL`.

## Directory Layout

```
src/
  App.jsx                 # Routes + global providers (AuthProvider + CartProvider)
  index.js                # React root
  index.css               # Tailwind entry + CSS custom properties + utility classes
  context/
    AuthContext.jsx        # useAuth(), login/logout, token persistence
    CartContext.jsx         # useCart(), client-side cart persisted in localStorage
  services/
    authService.js         # Shared axios instance + auth endpoints (default export = api)
    adminService.js        # Admin user CRUD; reuses the same axios instance
    cartService.js         # Product batch validation for cart
    orderService.js        # Buyer & seller order CRUD (create, cancel, refund, status updates)
    notificationService.js # Notification list, mark-read, mark-all-read
  components/
    common/                # Navbar, Footer, ProtectedRoute, RoleBasedRoute
    auth/                  # LoginForm, RegisterForm, OtpInput, SocialLogin
    admin/                 # Admin dashboard pieces + adminConstants.js
    profile/               # Sidebar, ProfileForm, OrderHistory
    cart/                  # CartItemCard, CartSummary
    order/                 # OrderCard, OrderItemRow, OrderStatusBadge, OrderTimeline,
                           #   CancelOrderDialog, RefundRequestDialog
    seller/                # (reserved for seller-specific components)
  pages/
    auth/                  # AuthPage, OAuth2RedirectPage
    home/                  # HomePage
    profile/index.jsx
    admin/index.jsx
    cart/index.jsx                       # Buyer cart page
    checkout/index.jsx                   # Checkout / order confirmation
    order-success/index.jsx              # Post-order success page
    orders/index.jsx                     # Buyer order list
    orders/OrderDetailPage.jsx           # Buyer order detail
    notifications/index.jsx              # Notification center
    seller/orders/index.jsx              # Seller order list
    seller/orders/SellerOrderDetailPage.jsx  # Seller order detail
  utils/
    adminUsers.js          # normalizeUser, unpackUsers, formatDate, getInitials
    orderUtils.js          # ORDER_STATUS, statusConfig, formatPrice, formatOrderDate
    http.js                # Http class with axios, refresh-token interceptor, redirect helpers
public/
  index.html
images/                    # Static design assets (not bundled by CRA)
plans/                     # Implementation plans & design specs (markdown)
figma-pencil.pen           # Pencil design file (read via MCP tools only)
```

## Route Map

All routes are declared in `src/App.jsx`. Current routes:

| Path                    | Component               | Access                  |
|-------------------------|-------------------------|-------------------------|
| `/auth`                 | `AuthPage`              | Public                  |
| `/oauth2/redirect`      | `OAuth2RedirectPage`    | Public                  |
| `/home`                 | `HomePage`              | `buyer`, `seller`       |
| `/profile`              | `ProfilePage`           | `buyer`, `seller`       |
| `/admin`                | `AdminPage`             | `admin`                 |
| `/cart`                 | `CartPage`              | `buyer`, `seller`       |
| `/checkout`             | `CheckoutPage`          | `buyer`, `seller`       |
| `/order-success`        | `OrderSuccessPage`      | `buyer`, `seller`       |
| `/orders`               | `OrdersPage`            | `buyer`, `seller`       |
| `/orders/:id`           | `OrderDetailPage`       | `buyer`, `seller`       |
| `/seller/orders`        | `SellerOrdersPage`      | `seller`                |
| `/seller/orders/:id`    | `SellerOrderDetailPage` | `seller`                |
| `/notifications`        | `NotificationsPage`     | Any authenticated user  |
| `/` or `*`              | Redirect to `/auth`     | —                       |

## Conventions

### File and component naming
- React components live in `.jsx` files, **PascalCase** (`AdminUserTable.jsx`, `LoginForm.jsx`).
- Page entry points use `index.jsx` inside the page folder (`pages/admin/index.jsx`).
- Non-index page files use PascalCase (`OrderDetailPage.jsx`, `SellerOrderDetailPage.jsx`).
- Utilities, services, and constants are `.js`, **camelCase** (`authService.js`, `adminUsers.js`, `adminConstants.js`).
- Default-export the main component or service object; named-export helpers.

### Imports
- Use relative imports (no path aliases are configured).
- Always import the shared `http` instance from `utils/http.js` instead of creating a new axios instance or using the old `api` instance from `authService.js`. `orderService.js` is a good reference pattern.

### Routing and access control
- All routes are declared in `src/App.jsx`.
- Wrap authenticated routes with `RoleBasedRoute` and pass `allowedRoles`. Use `ProtectedRoute` only when role does not matter (e.g. `/notifications`).
- Roles in use: `'buyer'`, `'seller'`, `'admin'`. Compare against `user?.role` (lowercase).
- Unauthenticated users are redirected to `/auth`. Admins land on `/admin`, buyers/sellers on `/profile` or `/home`.
- Wrong-role access: admins are redirected to `/admin`; non-admins to `/profile`.

### Auth flow
- `AuthContext` is the single source of truth. Read state via `useAuth()`; never read `localStorage` directly from components.
- `useAuth()` exposes: `user`, `token`, `login(userData, jwt)`, `logout()`, and `isAuthenticated` (boolean derived from `!!token`).
- `login(userData, jwt)` writes both `user` and `token` to `localStorage`. `logout()` clears them.
- The axios request interceptor in `authService.js` automatically attaches `Authorization: Bearer <token>`.
- OAuth2 redirect lands on `/auth` (or `/oauth2/redirect`) with `token` and `user` query params; `AuthPage` parses and calls `login()`.

### Cart flow
- `CartContext` manages a client-side shopping cart stored in `localStorage` under key `'cart'`.
- Read state via `useCart()`. Exposed values: `items`, `addItem(item)`, `removeItem(productId, selectedVariant)`, `updateQty(productId, selectedVariant, newQty)`, `clearCart()`, `itemCount`, `setItems`.
- Cart items are identified by the combination of `productId` + `selectedVariant`. The `addItem` function merges quantity for duplicates.
- `CartProvider` wraps the entire app (inside `AuthProvider`) in `App.jsx`.
- Cart data shape: `{ productId, selectedVariant, quantity, price, name, imageUrl, shopName, ... }`.

### Order flow
- **Buyer side**: Cart → Checkout → Order Success. `CheckoutPage` sends `{ shippingAddress, note, items: [{ productId, variantId, quantity }] }` to `POST /api/orders`. The API returns **an array** of `OrderDto` (items from different shops are split into separate orders). On success, clears the cart and navigates to `/order-success`.
- **Buyer order management**: `/orders` lists all orders (via `orderService.getMyOrders`), `/orders/:id` shows detail (with `items[]` and `history[]`). Buyer can cancel (`PATCH .../cancel`) or request refund (`PATCH .../refund`).
- **Seller side**: `/seller/orders` lists orders for the seller (same `/api/orders` endpoint with `role=seller`). Seller can confirm, ship, deliver, or cancel orders (all `PATCH`).
- **Listing responses** use Spring `Page<OrderDto>` format (`content`, `totalElements`, `totalPages`, `size`, `number`).
- Order statuses: `pending`, `confirmed`, `shipping`, `delivered`, `cancelled`, `refunded`. Status labels and colors are defined in `utils/orderUtils.js` (`ORDER_STATUS`, `statusConfig`).
- Payment type is currently `cod` (returned as `type` field in `OrderDto`).

### API calls
- Always go through a service module (`authService`, `adminService`, `cartService`, `orderService`, `notificationService`). Do not call `axios` or `http` directly from components.
- All service modules import the `http` instance from `utils/http.js`. This utility handles JWT injection and 401 token refreshes automatically.
- **Important**: The `http.js` utility is configured to unbox the standard Axios response. Service methods return the payload directly, meaning component consumers **should not** access `.data` on successful responses.
- Endpoint base paths follow the backend:
  - Auth: `/api/auth/...`
  - Admin: `/api/admin/users/...`
  - Cart: `/api/products/batch`
  - Orders (buyer & seller): `/api/orders/...` (distinguished by `?role=buyer|seller`)
  - Order actions: `PATCH /api/orders/{id}/cancel|confirm|ship|deliver|refund`
  - Notifications: `/api/notifications/...`
- Handle errors with try/catch and surface messages via `react-toastify`:
  ```js
  toast.error(error?.response?.data?.message || 'Fallback message in Vietnamese');
  ```
- Backend payload shapes vary; use `normalizeUser` and `unpackUsers` from `utils/adminUsers.js` when consuming user data.
- Use `formatPrice` and `formatOrderDate` from `utils/orderUtils.js` for currency and date formatting.

### Styling
- Tailwind utility classes are the primary styling approach. No CSS modules, no styled-components.
- **Exception**: `Navbar.jsx` currently uses inline `style` objects instead of Tailwind. Match that pattern when editing Navbar; do not refactor to Tailwind unless asked.
- Custom theme tokens live in `tailwind.config.js`:
  - Colors: `brand.50`–`brand.900`, `cream`, `dark`
  - Fonts: `font-display` and `font-body` both map to `"Be Vietnam Pro"`
  - Background images: `bg-auth-bg` → `url('/src/assets/auth-bg.jpg')`
- Prefer the brand palette over arbitrary hex values. Inline arbitrary values (`bg-[#fefee5]`) are used in some screens; match the surrounding file's style rather than refactoring on sight.
- Design language is warm/orange with cream backgrounds; keep it consistent.

#### CSS custom properties and utility classes (`index.css`)
- `index.css` imports `Be Vietnam Pro` from Google Fonts and defines the Tailwind directives (`@tailwind base/components/utilities`).
- CSS custom properties: `--brand-primary: #d4711e`, `--brand-dark: #7a3516`, `--cream: #fdf8f2`.
- Reusable utility classes defined with `@apply`:
  - `.social-btn` — social login button style
  - `.btn-primary` — primary action button (`bg-brand-500`, rounded-xl, full-width)
  - `.form-input` — standard input field
  - `.otp-input` — OTP digit input
- Animation classes: `.slide-in-right`, `.slide-in-left` (used for page/form transitions).
- When adding new global utility classes, add them to `index.css` using `@apply`.

### State and data
- Component-local state with `useState` / `useMemo` / `useEffect` is the norm. There is no Redux, Zustand, or React Query.
- Global state is limited to two React contexts: `AuthContext` (auth) and `CartContext` (cart).
- Derive filtered/paginated views with `useMemo` (see `pages/admin/index.jsx` for the canonical pattern).
- Optimistic updates use an `upsertLocalUser`-style helper that merges the server response back into local state.

### Notifications
- `<ToastContainer />` is mounted once in `App.jsx` (outside `<BrowserRouter>`, inside `<CartProvider>`). Just call `toast.success(...)` / `toast.error(...)` / `toast.info(...)` from anywhere.
- Toast configuration: `position="top-right"`, `autoClose={3000}`, `theme="light"`, custom `fontFamily: "Be Vietnam Pro"`.
- Keep toast messages short and in Vietnamese.

### Page layout pattern
- Most pages follow a consistent layout structure:
  ```jsx
  <div className="min-h-screen flex flex-col bg-[#f9f4ee] font-body text-[#3f3d2e]">
    <Navbar />
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Page content */}
    </main>
    <Footer />
  </div>
  ```
- Match this layout when creating new buyer/seller pages. Admin pages have their own sidebar-based layout.

## When Editing

- **Match the existing style** of the file you're touching. This codebase mixes Tailwind utilities with occasional arbitrary values and inline styles; do not reformat unrelated code.
- **Do not add dependencies** without a clear need. The dependency list is intentionally small.
- **Do not introduce TypeScript, ESLint configs, or test setup** unless explicitly asked.
- **Verify with `npm run build`** after non-trivial changes to make sure the CRA build still passes. There is no test suite to run.
- **Preserve role-based routing**. Any new authenticated page must be added to `App.jsx` behind `RoleBasedRoute` (or `ProtectedRoute` for role-agnostic pages) with the correct `allowedRoles`.
- **Keep secrets out of source**. Use `.env` and read via `process.env.REACT_APP_*`.
- **Do not edit `.pen` files** with text tools. Use the Pencil MCP server tools for design files.
- **Plans directory** (`plans/`) contains implementation specs. Consult these for context before building new features.

## Common Tasks

- **Add a new page**: create `src/pages/<area>/index.jsx` (or a named file), import it in `App.jsx`, wrap in `RoleBasedRoute`, add the path.
- **Add a new API call**: extend the relevant service (`authService`, `adminService`, `orderService`, etc.), or create a new `<feature>Service.js` that imports `api` from `authService.js`.
- **Add a new admin screen section**: drop a component in `src/components/admin/`, follow the `Admin*` naming, and compose it inside `pages/admin/index.jsx`.
- **Add a new seller page**: create under `src/pages/seller/<feature>/`, add seller-specific components in `src/components/seller/`, guard with `allowedRoles={["seller"]}`.
- **Add a new order-related component**: place in `src/components/order/`. Use `ORDER_STATUS` and `statusConfig` from `utils/orderUtils.js` for consistent status display.
- **Add a new context**: create in `src/context/`, wrap in `App.jsx` (inside `AuthProvider`), export a `use<Name>()` hook.
- **Adjust theme colors or fonts**: edit `tailwind.config.js` rather than overriding inline.
- **Add a new global CSS utility**: add to `src/index.css` using `@apply` under the `@tailwind utilities` layer.

## Known Quirks

- **Order API returns array**: `POST /api/orders` returns an array of `OrderDto[]` (one per shop). The checkout page handles this and shows order count on the success page.
- **`http.js` Http class**: `src/utils/http.js` exports a singleton `http` instance and the `Http` class. It has its own request/response interceptors with automatic JWT refresh (subscriber queue for concurrent 401s). All services have been migrated to use this instance, ensuring consistent authentication state and error handling.
- **Navbar inline styles**: The `Navbar` component uses inline `style` objects rather than Tailwind classes. This is intentional for now — match the style when editing.
- **Cart items grouped by `shopName`**: `CartPage` groups items by `shopName` field. If `shopName` is missing it defaults to `'Tiệm Cũ'`.
