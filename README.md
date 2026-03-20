# Ravoos Pansy -- Frontend

A production-grade React single-page application for a full-featured e-commerce platform. Built with Vite, Tailwind CSS, and React Router, featuring a complete customer storefront and a modular enterprise admin panel with analytics.

---

## Table of Contents

- [UI Architecture](#ui-architecture)
- [Performance Optimizations](#performance-optimizations)
- [Accessibility](#accessibility)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Features](#features)
- [State Management](#state-management)
- [Routing](#routing)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Production Build](#production-build)
- [Future Enhancements](#future-enhancements)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

---

## UI Architecture

The frontend follows a component-driven architecture with four distinct layers:

- **Layout layer** -- AdminLayout, customer Layout (Navbar + Footer), Sidebar
- **Page layer** -- AdminProducts, AdminOrders, Home, Items, ProductDetail, etc.
- **Reusable primitives** -- Modal, DataTable, ConfirmDialog, Pagination, StarRating
- **Context layer** -- Auth, Cart, Wishlist, Theme, Toast

---

## Performance Optimizations

- **Code splitting** -- All pages and admin modules are lazy-loaded via `React.lazy()`, keeping the initial bundle under 95KB gzipped
- **Parallel data fetching** -- Homepage and admin dashboard use `Promise.all` to fetch multiple endpoints concurrently
- **Image lazy loading** -- Product images use `loading="lazy"` for deferred loading below the fold
- **Debounced search** -- Search inputs are debounced at 400ms to reduce API calls
- **Canvas rendering** -- Revenue chart uses Canvas 2D API instead of a charting library, reducing bundle size
- **Skeleton loading** -- Per-section loading states prevent layout shift and improve perceived performance
- **Scroll snapping** -- Horizontal product lists use CSS scroll snapping on mobile for native-feel navigation
- **Optimistic updates** -- Address deletion provides instant feedback with automatic rollback on failure
- **Denormalized data** -- Product ratings are pre-calculated server-side, avoiding client-side computation
- **Conditional rendering** -- Components guard against unnecessary re-renders using state checks
- **Pagination** -- Admin-heavy datasets use server-side or client-side pagination to limit DOM nodes

---

## Accessibility

- Semantic HTML structure throughout all pages
- Keyboard-navigable modals with Escape to close
- ARIA labels for interactive elements (buttons, toggles, inputs)
- Sufficient color contrast in both light and dark modes

---

## Architecture

The application follows a feature-based folder structure with clear separation between the customer storefront and the admin panel. Both share the same API layer and context providers but have independent layouts, routing, and component trees.

```
                        +-------------------+
                        |     App.jsx       |
                        |  (React Router)   |
                        +---------+---------+
                                  |
                   +--------------+--------------+
                   |                              |
           +-------+-------+            +--------+--------+
           |   Customer    |            |   Admin Panel   |
           |   Layout      |            |   AdminLayout   |
           | (Navbar+Footer)|           | (Sidebar+Header)|
           +-------+-------+            +--------+--------+
                   |                              |
         +---------+---------+          +---------+---------+
         | Home, Items,      |          | Overview, Products|
         | ProductDetail,    |          | Categories, Orders|
         | Cart, Checkout,   |          | Coupons, Reviews  |
         | Profile, Orders,  |          +-------------------+
         | Wishlist          |
         +-------------------+

         +---------------------------------------------------+
         |              Context Providers                     |
         | Auth | Cart | Wishlist | Theme | Toast             |
         +---------------------------------------------------+
         |              API Layer (Axios)                     |
         +---------------------------------------------------+
```

Key architectural decisions:

- **Lazy loading** for all page-level components via `React.lazy()` with Suspense
- **Context-based state management** without external libraries
- **Parallel API fetching** with `Promise.all` for dashboard and homepage data
- **Optimistic UI updates** for address deletion (immediate feedback, rollback on failure)
- **Portal-based modals** rendering to document.body for proper z-index isolation
- **Canvas-based charting** for the revenue chart (zero charting library dependencies)

---

## Tech Stack

| Layer       | Technology   | Version |
| ----------- | ------------ | ------- |
| UI Library  | React        | 19.2    |
| Build Tool  | Vite         | 7.2     |
| Routing     | React Router | 7.11    |
| Styling     | Tailwind CSS | 3.4     |
| HTTP Client | Axios        | 1.13    |
| Linting     | ESLint       | 9.39    |

Zero external UI component libraries. All components are built from scratch with Tailwind CSS utility classes.

---

## Folder Structure

```
src/
  api/
    axios.js                    # Axios instance with token interceptor

  context/
    AuthContext.jsx              # User authentication state
    CartContext.jsx              # Shopping cart state and count
    WishlistContext.jsx          # Wishlist state and toggle logic
    ThemeContext.jsx             # Dark/light theme management
    ToastContext.jsx             # Toast notification queue

  hooks/
    useDebounce.js              # Debounce hook for search inputs

  utils/
    format.js                   # Currency formatter, new product detection

  components/
    Layout.jsx                  # Customer layout (Navbar + Footer)
    Navbar.jsx                  # Navigation with cart/wishlist badges
    Footer.jsx                  # Site footer
    AdminRoute.jsx              # Admin role guard
    UserOnlyRoute.jsx           # Customer role guard
    Toast.jsx                   # Toast notification display
    Skeleton.jsx                # Loading skeleton components
    StarRating.jsx              # Star rating display
    StarRatingInput.jsx         # Interactive star rating input
    ReviewCard.jsx              # Single review card

    home/                       # Home page components
      HeroSection.jsx           # Landing hero with gradient overlay
      CategoryGrid.jsx          # Category navigation cards
      ProductSection.jsx        # Reusable product grid/scroll section
      ProductCard.jsx           # Product card with badges and rating
      OfferBanner.jsx           # Promotional banner

    profile/                    # Profile page components
      ProfileHeader.jsx         # Avatar, name editing, role badge
      QuickActions.jsx          # Action cards (orders, browse, admin)
      AddressManager.jsx        # Address CRUD with optimistic delete
      AddressCard.jsx           # Individual address display
      AddressForm.jsx           # Address create/edit form

  admin/
    AdminLayout.jsx             # Admin shell (sidebar + header + outlet)

    components/                 # Admin shared primitives
      AdminSidebar.jsx          # Navigation with icons and active states
      AdminHeader.jsx           # Page title bar with mobile hamburger
      Modal.jsx                 # Portal-based dialog
      ConfirmDialog.jsx         # Delete confirmation wrapper
      DataTable.jsx             # Configurable table with loading states
      Pagination.jsx            # Page navigation with ellipsis
      StatCard.jsx              # Metric display card
      GrowthCard.jsx            # Growth percentage card
      StatusBadge.jsx           # Order/coupon status pill
      StatusBar.jsx             # Horizontal status distribution bars
      RevenueChart.jsx          # Canvas line chart

    pages/                      # Admin page views
      AdminOverview.jsx         # Dashboard with analytics
      AdminProducts.jsx         # Product CRUD with modals
      AdminCategories.jsx       # Category tree management
      AdminOrders.jsx           # Order management with status updates
      AdminCoupons.jsx          # Coupon CRUD with usage data
      AdminReviews.jsx          # Review moderation

  pages/                        # Customer page views
    Home.jsx                    # Landing page
    Items.jsx                   # Product catalog with filters
    ProductDetail.jsx           # Product detail with reviews
    Cart.jsx                    # Shopping cart
    Checkout.jsx                # Payment flow (Razorpay)
    Profile.jsx                 # User profile with tabs
    Orders.jsx                  # Order history
    Wishlist.jsx                # Wishlist management
    Login.jsx                   # Authentication
    Signup.jsx                  # Registration
    NotFound.jsx                # 404 page
```

---

## Features

### Customer Storefront

**Homepage**

- Animated hero section with gradient background, dot pattern overlay, and bottom fade
- Category navigation grid with hover animations (Food, Drinks, Clothes, Gaming)
- Featured products section with horizontal scroll snapping on mobile
- Category-specific product previews (Food Picks, Gaming Essentials)
- Promotional offer banner with decorative blur elements
- Per-section skeleton loading states

**Product Catalog**

- Hierarchical category sidebar with expandable tree navigation
- SEO-friendly category URLs (`/items/c/clothes/men/shirts`)
- Debounced search filtering (400ms)
- Product cards with NEW badge (created within 7 days), LOW STOCK indicator, and SOLD OUT state
- Formatted Indian Rupee pricing
- Star ratings with review counts
- Lazy-loaded images with hover zoom

**Product Detail**

- Breadcrumb navigation reflecting full category hierarchy
- Product image with fallback handling
- Add to cart with stock validation
- Wishlist toggle (filled/empty heart icon)
- Review section with create, edit, and delete
- Interactive star rating input (1-5)
- Purchase verification for review eligibility (delivered orders only)

**Shopping Cart**

- Quantity adjustment with stock-aware limits
- Item removal
- Running subtotal calculation

**Checkout**

- Saved address selection
- Coupon code validation and discount application
- Price breakdown (subtotal + 5% GST - discount)
- Razorpay payment gateway integration with dynamic script loading
- Order confirmation

**Profile**

- Tab-based navigation (Profile and Addresses) with icons
- Inline name editing with save/cancel
- Role badge (Customer or Admin)
- Quick action cards for contextual navigation (different for admin vs customer)

**Address Management**

- Address list with default address highlight (ring indicator)
- Add new address via dashed button
- Edit existing addresses via form
- Optimistic delete with confirmation modal and rollback on failure
- Empty state with SVG icon

**Order History**

- Order list with multi-stage status timeline
- Financial breakdown per order
- Order cancellation

**Wishlist**

- Product cards with move-to-cart action
- Remove from wishlist
- Stock status awareness

### Admin Panel

**Layout**

- Fixed sidebar with 6 navigation sections and active state highlighting
- Responsive: sidebar collapses to overlay on mobile with backdrop
- Header with dynamic page title and hamburger toggle
- Theme toggle and "Back to Store" link

**Overview Dashboard**

- 9 stat cards: total and daily revenue, orders, users, products, low stock, AOV
- 3 growth cards: 30-day revenue, order, and user growth with directional arrows
- Canvas-based revenue line chart with responsive DPR scaling
- Order status distribution bars
- Top products table by quantity sold
- Coupon analytics: summary, top performer, usage table, unused coupons
- Wishlist statistics with most wishlisted products

**Product Management**

- Full product table with search and client-side pagination (10 per page)
- Image thumbnails, category breadcrumb paths, color-coded stock levels (red/amber/normal)
- Create and edit via modal form (name, description, price, stock, category, image URL)
- Category selector with indented tree hierarchy
- Delete with confirmation dialog

**Category Management**

- Recursive tree display with expand/collapse controls
- Hover-reveal edit and delete buttons per node
- Create and edit via modal (name, slug, parent selector, theme, active toggle)
- Auto-slug generation from category name
- Circular parent prevention (backend validated)
- Referential integrity checks before deletion

**Order Management**

- Server-side paginated order table (15 per page)
- Status filter toolbar (All + 7 individual statuses)
- Inline status update via dropdown
- Expandable order detail showing address, items, and financial breakdown
- Customer name and email display

**Coupon Management**

- Coupon table with usage analytics merged from separate API
- Code display in monospace font
- Active/inactive status badges
- Create and edit via modal
- Delete with confirmation

**Review Moderation**

- Server-side paginated review table (10 per page)
- User, product, star rating, truncated comment, and date display
- Delete with confirmation dialog

---

## State Management

The application uses React Context for global state, avoiding external state management libraries. Five context providers are nested in a specific dependency order.

### Provider Hierarchy

```
ThemeProvider
  AuthProvider
    ToastProvider
      CartProvider          (depends on AuthContext)
        WishlistProvider    (depends on AuthContext)
          App
```

### Context Details

| Context         | State                          | Key Methods                                                  |
| --------------- | ------------------------------ | ------------------------------------------------------------ |
| AuthContext     | `user`, `loading`              | `login()`, `logout()`, `refreshUser()`                       |
| CartContext     | `cartCount`                    | `addToCart()`, `refreshCart()`                               |
| WishlistContext | `wishlistIds`, `wishlistCount` | `toggleWishlist()`, `isWishlisted()`, `removeFromWishlist()` |
| ThemeContext    | `theme`                        | `toggleTheme()`                                              |
| ToastContext    | `toasts`                       | `toast(message, type)`                                       |

CartContext and WishlistContext automatically reset when the user logs out or when an admin is logged in (admins cannot use cart/wishlist).

---

## Routing

All page components are lazy-loaded. The admin panel uses nested routes with its own layout.

```
/                               Home (public)
/items                          Product catalog (public)
/items/c/*                      Category-filtered catalog (public)
/items/:id                      Product detail (public)
/profile                        User profile (public, guest view if not logged in)

/wishlist                       Wishlist (user-only guard)
/cart                           Cart (user-only guard)
/checkout                       Checkout (user-only guard)
/orders                         Order history (user-only guard)

/admin                          Admin overview (admin guard, AdminLayout)
/admin/products                 Product management
/admin/categories               Category management
/admin/orders                   Order management
/admin/coupons                  Coupon management
/admin/reviews                  Review management

/login                          Login (no layout wrapper)
/signup                         Signup (no layout wrapper)
*                               404 Not Found
```

Route guards:

- **AdminRoute** -- Requires `user.role === "admin"`, redirects to `/` otherwise
- **UserOnlyRoute** -- Requires `user.role === "user"`, redirects to `/login` for guests, `/` for admins

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
cd ravoos-pansy-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your backend URL
```

---

## Environment Variables

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

This is the only required environment variable. It points to the Django backend base URL (without trailing `/api/`).

---

## Running Locally

```bash
# Start development server
npm run dev

# Server starts at http://localhost:5173
```

Ensure the Django backend is running at the URL specified in `VITE_API_BASE_URL`.

---

## Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The build output is written to the `dist/` directory. Serve with any static file host (Nginx, Vercel, Cloudflare Pages, Netlify).

---

## Future Enhancements

- [ ] Image upload with drag-and-drop (Cloudinary/S3 integration)
- [ ] Product variant support (size, color selectors)
- [ ] Real-time order status updates via WebSocket
- [ ] Advanced search with filters (price range, rating, availability)
- [ ] Infinite scroll for product listings
- [ ] PWA support with offline product browsing
- [ ] Accessibility audit and ARIA improvements
- [ ] E2E testing with Playwright
- [ ] Internationalization (i18n) support
- [ ] Customer review photo uploads
- [ ] Order invoice PDF generation
- [ ] Social login (Google, GitHub)

---

## Screenshots

> Screenshots will be added here.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes with clear messages
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request with a description of your changes

Ensure `npm run build` passes without errors before submitting.
