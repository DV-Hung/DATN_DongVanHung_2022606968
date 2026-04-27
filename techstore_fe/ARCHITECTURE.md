# 📁 Project Structure Guide

## Overview
This project follows a **Feature-Based Architecture** combined with a **shared/common** approach for optimal scalability and maintainability.

## Directory Structure

```
e:\DATN\Demo_fe/
├── public/                          # Static assets
│   └── (images, fonts, etc.)
│
├── src/
│   ├── App.tsx                      # Main app component with routing
│   ├── main.tsx                     # Vite entry point
│   ├── index.css                    # Global styles with Tailwind
│   │
│   ├── config/                      # App configuration
│   │   └── (environment configs, constants for different environments)
│   │
│   ├── features/                    # Feature modules (scalable, independent)
│   │   ├── auth/                    # Authentication feature
│   │   │   ├── components/          # Auth-specific components
│   │   │   ├── hooks/               # Auth-specific hooks
│   │   │   ├── services/            # Auth API services
│   │   │   ├── pages/               # Auth pages (Login, Register)
│   │   │   └── index.ts             # Feature exports
│   │   │
│   │   ├── products/                # Products listing feature
│   │   │   ├── components/          # Product components
│   │   │   │   └── ProductCard.tsx  # Single product card
│   │   │   ├── hooks/               # Product hooks
│   │   │   │   └── useProducts.ts   # Product filtering, searching
│   │   │   ├── services/            # Product API services
│   │   │   ├── pages/               # Product pages
│   │   │   │   └── ProductsPage.tsx # Products listing page
│   │   │   └── index.ts             # Feature exports
│   │   │
│   │   ├── cart/                    # Shopping cart feature
│   │   │   ├── components/          # Cart UI components
│   │   │   ├── hooks/               # Cart logic hooks
│   │   │   ├── services/            # Cart API services
│   │   │   ├── pages/               # Cart pages
│   │   │   └── index.ts
│   │   │
│   │   ├── checkout/                # Checkout process
│   │   │   ├── components/          # Checkout steps
│   │   │   ├── hooks/               # Checkout logic
│   │   │   ├── services/            # Payment services
│   │   │   ├── pages/               # Checkout page
│   │   │   └── index.ts
│   │   │
│   │   ├── orders/                  # Order management
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── pages/
│   │   │   └── index.ts
│   │   │
│   │   ├── profile/                 # User profile
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── pages/
│   │   │   └── index.ts
│   │   │
│   │   └── wishlist/                # Wishlist feature
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── pages/
│   │       └── index.ts
│   │
│   ├── shared/                      # Shared resources (used across features)
│   │   ├── components/              # Reusable components
│   │   │   ├── Header.tsx           # App header
│   │   │   ├── Footer.tsx           # App footer
│   │   │   ├── ProductCard.tsx      # Reusable product card
│   │   │   ├── FilterSidebar.tsx    # Product filters
│   │   │   ├── Pagination.tsx       # Pagination control
│   │   │   ├── Breadcrumb.tsx       # Navigation breadcrumb
│   │   │   └── index.ts             # Component exports
│   │   │
│   │   ├── hooks/                   # Reusable custom hooks
│   │   │   ├── useCart.ts           # Cart state management
│   │   │   ├── useLocalStorage.ts   # Local storage hook
│   │   │   └── index.ts             # Hook exports
│   │   │
│   │   ├── types/                   # TypeScript types & interfaces
│   │   │   └── index.ts             # All type definitions
│   │   │       - Product interface
│   │   │       - ProductFilter interface
│   │   │       - PaginationParams interface
│   │   │       - NavLink interface
│   │   │       - etc.
│   │   │
│   │   ├── constants/               # App constants
│   │   │   └── index.ts             # Constants
│   │   │       - APP_NAME
│   │   │       - MAIN_NAV_LINKS
│   │   │       - Brand options
│   │   │       - API endpoints
│   │   │       - etc.
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── helpers.ts           # Helper functions
│   │   │   │   - formatPrice()
│   │   │   │   - generateSlug()
│   │   │   │   - debounce()
│   │   │   │   - throttle()
│   │   │   │   - getDiscountPercentage()
│   │   │   │   - etc.
│   │   │   └── index.ts             # Utils exports
│   │   │
│   │   └── styles/                  # Shared styles
│   │       └── (global styles, variables)
│   │
│   ├── layouts/                     # Layout components
│   │   └── MainLayout.tsx           # Main app layout wrapper
│   │
│   └── services/                    # API services
│       └── api.ts                   # Centralized API client using Axios
│           - apiClient instance
│           - Request/response interceptors
│           - All API methods
│
├── .gitignore                       # Git ignore rules
├── .eslintrc.cjs                    # ESLint configuration
├── index.html                       # HTML entry point
├── package.json                     # Dependencies & scripts
├── postcss.config.js                # PostCSS configuration
├── README.md                        # Project documentation
├── tailwind.config.js               # Tailwind CSS config
├── tsconfig.json                    # TypeScript compiler options
├── tsconfig.node.json               # TypeScript for Node files
└── vite.config.ts                   # Vite build configuration
```

## 🎯 Architecture Principles

### 1. **Feature-Based Organization**
- Each feature is self-contained with its own components, hooks, services
- Easy to scale: add new features without affecting existing code
- Each feature can be developed independently

### 2. **Shared Resources**
- Common components used across multiple features
- Custom hooks for reusable logic
- Global types and constants
- Utility functions

### 3. **Separation of Concerns**
- Components: UI rendering
- Hooks: Business logic and state management
- Services: API communication
- Types: Data structure definitions
- Utils: Helper functions

### 4. **Scalability**
- Adding new feature: create folder in `features/`
- Each feature follows the same structure
- Promotes code reuse and consistency

## 📊 File Naming Conventions

- **Components**: `PascalCase` (e.g., `ProductCard.tsx`)
- **Hooks**: `camelCase` prefix with `use` (e.g., `useProducts.ts`)
- **Services**: `camelCase` (e.g., `productService.ts`)
- **Types**: `PascalCase` (e.g., `Product.ts`)
- **Utils**: `camelCase` (e.g., `helpers.ts`)

## 🔄 Data Flow

```
User Input
    ↓
Component
    ↓
Hook (Business Logic)
    ↓
Service (API Call)
    ↓
Store/State Management (React Query, Context)
    ↓
Component Re-render
    ↓
UI Update
```

## 📦 Feature Template

When creating a new feature:

```
src/features/[feature-name]/
├── components/
│   ├── [ComponentName].tsx
│   └── index.ts
├── hooks/
│   ├── use[FeatureName].ts
│   └── index.ts
├── services/
│   ├── [featureName]Service.ts
│   └── index.ts
├── pages/
│   ├── [FeatureName]Page.tsx
│   └── index.ts
├── types/
│   └── index.ts
├── utils/
│   ├── helpers.ts
│   └── index.ts
└── index.ts (main export)
```

## 🚀 Adding a New Feature

1. **Create feature folder**: `src/features/[new-feature]/`
2. **Create subfolders**: components, hooks, services, pages, types, utils
3. **Define types** in `types/index.ts`
4. **Create components** in `components/`
5. **Create hooks** in `hooks/` for business logic
6. **Create services** in `services/` for API calls
7. **Create pages** in `pages/` for views
8. **Export everything** from feature `index.ts`

## 🔌 Component Reusability

**Reusable (in shared/components):**
- Header
- Footer
- ProductCard
- FilterSidebar
- Pagination
- Breadcrumb
- Buttons
- Forms

**Feature-Specific (in features/[name]/components):**
- Product detail component
- Checkout form
- Account settings
- Order history

## 💾 Local Storage Strategy

Use `useLocalStorage` hook for:
- Cart items
- User preferences
- Auth tokens (with caution)
- Filter preferences

## 🔐 API Integration

API client handles:
- Base URL configuration
- Request/Response interceptors
- Authentication token management
- Error handling
- Timeout management

All API calls should go through `src/services/api.ts`

## 📈 Git Workflow

```
Feature branch: feature/[feature-name]
Commit structure:
- feat: Add new feature
- fix: Fix bug
- refactor: Refactor code
- style: Styling changes
- docs: Documentation
```

---

**This structure ensures scalability, maintainability, and team collaboration!**
