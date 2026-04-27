# Tech Store - E-Commerce Platform

Premium e-commerce platform for high-end electronics (laptops, mobile devices, audio equipment) built with modern web technologies.

## 🏗️ Architecture

### Feature-Based Structure
```
src/
├── features/           # Feature modules
│   ├── auth/          # Authentication
│   ├── products/      # Products listing & details
│   ├── cart/          # Shopping cart
│   ├── checkout/      # Checkout process
│   ├── orders/        # Order management
│   ├── wishlist/      # Wishlist
│   └── profile/       # User profile
├── shared/            # Shared resources
│   ├── components/    # Reusable components (Header, Footer, etc.)
│   ├── hooks/         # Custom hooks
│   ├── types/         # TypeScript types & interfaces
│   ├── constants/     # App constants
│   ├── utils/         # Utility functions
│   └── styles/        # Global styles
├── layouts/          # Layout components
├── services/         # API services
├── config/          # Config files
└── App.tsx          # Main app component
```

## 📦 Technology Stack

- **Frontend Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Language**: TypeScript 5.2
- **Styling**: Tailwind CSS 3.3
- **Routing**: React Router 6.18
- **State Management**: React Query 5.28
- **HTTP Client**: Axios 1.6
- **Development**: ESLint, TypeScript strict mode

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Start development server**
```bash
npm run dev
```
Server will run at http://localhost:3000

3. **Build for production**
```bash
npm run build
```

4. **Preview production build**
```bash
npm run preview
```

5. **Type check**
```bash
npm run type-check
```

## 🎨 Key Components

### Shared Components
- **Header** - Navigation header with search and user menu
- **Footer** - Company info, navigation links, newsletter signup
- **ProductCard** - Product display card with pricing and specs
- **FilterSidebar** - Advanced filter panel (brand, price, processor, memory)
- **Pagination** - Paginated product navigation
- **Breadcrumb** - Navigation breadcrumb trail

### Product Features
- **ProductsPage** - Main products listing page with:
  - Dynamic filtering
  - Sorting options
  - Pagination
  - Responsive grid layout
  - Loading states
  - Empty states

## 🔧 Configuration Files

- **vite.config.ts** - Vite configuration for build optimization
- **tailwind.config.js** - Tailwind CSS customization
- **tsconfig.json** - TypeScript compiler options
- **postcss.config.js** - PostCSS & Autoprefixer setup
- **package.json** - Project dependencies and scripts

## 📱 Responsive Design

- **Mobile First** approach with Tailwind CSS
- **Breakpoints**:
  - sm: 640px
  - md: 768px  
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

## 🎯 Features

### Current Features
✅ Product listing with grid layout
✅ Advanced filtering (brand, price, processor, memory)
✅ Product sorting
✅ Pagination with smart page navigation
✅ Product search
✅ Responsive design
✅ Modern UI with Tailwind CSS
✅ TypeScript for type safety
✅ Mock data for development

### Upcoming Features
- Shopping cart functionality
- Checkout process
- User authentication & profiles
- Order management
- Wishlist
- Product details page
- Product reviews & ratings
- Payment integration
- Admin dashboard

## 📊 Data Structure

### Product Interface
```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  badge?: 'NEW ARRIVAL' | 'BEST SELLER' | 'SALE';
  rating?: number;
  reviews?: number;
  brand: string;
  processor?: string;
  memory?: string;
  storage?: string;
  display?: string;
  inStock: boolean;
}
```

### Filter Interface
```typescript
interface ProductFilter {
  brand?: string[];
  priceRange?: { min: number; max: number };
  processor?: string[];
  memory?: string[];
  category?: string;
}
```

## 🔌 API Integration Ready

The project is structured to easily integrate with backend APIs:
- Service layer in `src/services/` for API calls
- React Query setup for state management
- Axios configured for HTTP requests
- Mock data can be replaced with real API calls

## 🎯 Best Practices

- ✅ Feature-based folder structure for scalability
- ✅ Component composition and reusability
- ✅ TypeScript strict mode for type safety
- ✅ ESLint for code quality
- ✅ Responsive design principles
- ✅ Accessibility considerations
- ✅ Performance optimization (code splitting, lazy loading ready)

## 📝 Environment Setup

Create `.env` file for environment variables:
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Tech Store
```

## 🐛 Debugging

- Browser DevTools for React debugging
- React Query DevTools (optional installation)
- TypeScript type checking in IDE
- Console logging for development

## 📄 Project Statistics

- **Components**: 6 shared + feature-specific
- **Pages**: 1 main (ProductsPage)
- **Hooks**: Custom product filtering hook
- **Lines of Code**: ~2000+ lines
- **Type Safety**: 100% TypeScript

## 🤝 Contributing

When adding new features:
1. Follow the feature-based structure
2. Create feature folder if needed
3. Include components, hooks, services, pages subfolders
4. Add TypeScript types in shared/types
5. Maintain responsive design
6. Test on mobile and desktop

## 📞 Support

For issues or questions, please create an issue or contact the development team.

## 📄 License

This project is proprietary software for internal use.

---

**Built with ❤️ using React + Vite + TypeScript + Tailwind CSS**
