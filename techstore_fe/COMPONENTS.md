# 🎨 Component Library Documentation

## Shared Components

### Header Component
Location: `src/shared/components/Header.tsx`

**Features:**
- Navigation menu
- Search functionality
- Cart icon with badge
- User account icon
- Mobile responsive menu
- Sticky positioning

**Props:**
```typescript
interface HeaderProps {
  onSearchChange?: (query: string) => void;
}
```

**Usage:**
```tsx
<Header onSearchChange={handleSearch} />
```

---

### Footer Component
Location: `src/shared/components/Footer.tsx`

**Features:**
- Company branding
- Navigation links (4 columns)
- Newsletter signup
- Social media links
- Copyright info

**Usage:**
```tsx
<Footer />
```

---

### ProductCard Component
Location: `src/shared/components/ProductCard.tsx`

**Features:**
- Product image with hover effect
- Brand badge
- Product name and description
- Product specifications (processor, RAM, storage, display)
- Star rating with review count
- Original and current price with discount
- Add to cart button
- Out of stock state

**Props:**
```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}
```

**Usage:**
```tsx
<ProductCard 
  product={product}
  onAddToCart={(prod) => console.log('Added:', prod)}
/>
```

---

### FilterSidebar Component
Location: `src/shared/components/FilterSidebar.tsx`

**Features:**
- Collapsible filter sections
- Brand selection checkboxes
- Price range slider
- Processor filter
- Memory filter
- Clear all filters button
- Live filter updates

**Props:**
```typescript
interface FilterSidebarProps {
  onFilterChange: (filters: ProductFilter) => void;
}
```

**Usage:**
```tsx
<FilterSidebar onFilterChange={handleFilters} />
```

---

### Pagination Component
Location: `src/shared/components/Pagination.tsx`

**Features:**
- Smart page number display
- Previous/Next buttons
- Ellipsis for large page counts
- Loading state
- Accessibility attributes (ARIA)
- Current page highlighting

**Props:**
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}
```

**Usage:**
```tsx
<Pagination
  currentPage={1}
  totalPages={12}
  onPageChange={handlePageChange}
/>
```

---

### Breadcrumb Component
Location: `src/shared/components/Breadcrumb.tsx`

**Features:**
- Navigation trail
- Clickable links
- Current page as text
- Chevron separators
- SEO friendly

**Props:**
```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

interface BreadcrumbItem {
  label: string;
  path?: string; // Optional for current page
}
```

**Usage:**
```tsx
<Breadcrumb items={[
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Laptops' }
]} />
```

---

## Custom Hooks

### useCart Hook
Location: `src/shared/hooks/useCart.ts`

**Features:**
- Add items to cart
- Remove items
- Update quantity
- Clear cart
- Calculate total price
- Get total quantity

**Usage:**
```tsx
const { cart, addToCart, removeFromCart, getTotalPrice } = useCart();

addToCart(product, 2);
const total = getTotalPrice();
```

---

### useLocalStorage Hook
Location: `src/shared/hooks/useLocalStorage.ts`

**Features:**
- Read from localStorage
- Write to localStorage
- Automatic JSON serialization
- Error handling

**Usage:**
```tsx
const [user, setUser] = useLocalStorage('user', null);

setUser({ name: 'John' });
```

---

### useProducts Hook
Location: `src/features/products/hooks/useProducts.ts`

**Features:**
- Fetch products with filters
- Search products
- Apply multiple filters
- Loading state
- Mock data for development

**Usage:**
```tsx
const { products, isLoading, applyFilters, searchProducts } = useProducts();

applyFilters({ brand: ['apple', 'dell'] });
searchProducts('laptop');
```

---

## Pages

### ProductsPage
Location: `src/features/products/pages/ProductsPage.tsx`

**Features:**
- Header with search
- Breadcrumb navigation
- Title and description
- Filter sidebar (desktop)
- Products grid
- Sort dropdown
- Pagination
- Footer
- Loading states
- Empty states
- Responsive layout

**Layout:**
- Desktop: 4 columns (sidebar + 3 product cols)
- Tablet: 2 columns
- Mobile: 1 column

---

## Styling Guide

### Color Scheme
- Primary Blue: `#0066cc`
- Dark Gray: `#1a1a1a`
- Light Gray: `#f0f0f0`
- Border Gray: `#e0e0e0`
- Success Green: `#28a745`
- Danger Red: `#dc3545`

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Typography
- Heading 1: 32px, Bold
- Heading 2: 24px, Bold
- Heading 3: 20px, Semibold
- Body: 16px, Regular
- Small: 14px, Regular
- Tiny: 12px, Regular

### Shadows
- sm: `shadow-sm`
- md: `shadow-md`
- lg: `shadow-lg`
- xl: `shadow-xl`

---

## Responsive Breakpoints

```
- Mobile First (< 640px)
- Tablet (640px - 1024px)
- Desktop (1024px - 1280px)
- Wide (> 1280px)
```

---

## Using Tailwind CSS

### Common Classes

**Layout:**
- `flex`, `grid`, `flex-col`, `grid-cols-3`
- `gap-4`, `gap-x-6`, `gap-y-2`
- `p-4`, `px-4`, `py-2`

**Typography:**
- `text-xl`, `font-bold`, `text-gray-600`
- `leading-6`, `tracking-wide`

**Colors:**
- `bg-gray-100`, `text-blue-600`
- `border-gray-300`, `bg-opacity-50`

**Utilities:**
- `rounded-lg`, `shadow-md`
- `hover:bg-gray-100`, `transition`
- `disabled:opacity-50`, `disabled:cursor-not-allowed`

### Custom Tailwind Components

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm hover:shadow-md transition;
  }
}
```

---

## Accessibility

### ARIA Attributes
- `aria-label` - For icon buttons
- `aria-current="page"` - Current page in pagination
- `aria-hidden="true"` - For decorative elements
- `role="button"` - For clickable divs

### Keyboard Navigation
- Tab key for focus
- Enter key to activate
- Escape key to close modals

### Color Contrast
- All text meets WCAG AA standards
- 4.5:1 ratio for normal text
- 3:1 ratio for large text

---

## Performance Tips

1. **Code Splitting**: Use React.lazy() for pages
2. **Image Optimization**: Use next-gen formats (WebP)
3. **Bundle Size**: Monitor with Vite
4. **Caching**: Leverage browser cache
5. **Lazy Loading**: Images and components

---

## Testing Components

Example unit test:

```tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
  });
  
  it('calls onAddToCart when button clicked', () => {
    const handleAdd = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={handleAdd} />);
    screen.getByText('Add').click();
    expect(handleAdd).toHaveBeenCalled();
  });
});
```

---

## Common Issues & Solutions

### Issue: Component not rendering
**Solution:** Check props are passed correctly, verify imports

### Issue: Styling not applied
**Solution:** Ensure Tailwind CSS is configured, rebuild CSS

### Issue: State not updating
**Solution:** Use proper state management hook, check dependencies

### Issue: Performance slow
**Solution:** Use React.memo for components, useMemo for expensive calculations

---

## Admin Components

### VariantForm Component
Location: `src/features/admin/components/VariantForm.tsx`

**Features:**
- Modal form for adding/editing product variants
- Variant attributes section (color, storage)
- Logistics & pricing section
- Form validation with error messages
- Support for multiple colors and storage options

**Props:**
```typescript
interface VariantFormProps {
  variant?: Variant;
  onSave: (variant: Variant) => void;
  onCancel: () => void;
  colors?: string[];
  storageOptions?: string[];
}
```

**Usage:**
```tsx
const [showForm, setShowForm] = useState(false);

<VariantForm
  variant={editingVariant}
  onSave={handleSaveVariant}
  onCancel={() => setShowForm(false)}
  colors={['Gray', 'Blue', 'Titanium']}
  storageOptions={['256GB', '512GB', '1TB']}
/>
```

---

### VariantsTable Component
Location: `src/features/admin/components/VariantsTable.tsx`

**Features:**
- Display variants in a sortable table
- Show variant info (color, storage, image)
- Display pricing and stock information
- Stock level indicator with color coding
- Edit and delete actions for each variant
- Summary footer with totals

**Props:**
```typescript
interface VariantsTableProps {
  variants: Variant[];
  onEdit: (variant: Variant) => void;
  onDelete: (variantId: string) => void;
  baseSku?: string;
}
```

**Stock Color Coding:**
- Green: Stock > 50 units
- Yellow: Stock 20-50 units
- Red: Stock < 20 units

**Usage:**
```tsx
<VariantsTable
  variants={variants}
  onEdit={handleEditVariant}
  onDelete={handleDeleteVariant}
  baseSku="ARCH-PH-V4"
/>
```

---

### AdminProductVariants Page
Location: `src/features/admin/pages/AdminProductVariants.tsx`

**Features:**
- Full-page product variant management interface
- Product information header with SKU
- Statistics cards (Active Variants, Total Stock, Lowest Stock, Avg Price)
- Sort and filter controls
- Variants table with all operations
- Integrated VariantForm modal

**Statistics:**
- Active Variants count
- Total Stock in inventory
- Lowest Stock variant
- Average Price across variants

**Sort Options:**
- By Name
- Price: Low to High
- Price: High to Low
- Stock Level
- Color

**Filter Options:**
- All Variants
- Active Only
- Inactive Only
- Low Stock (< 20 units)

**Usage:**
```tsx
import { AdminProductVariants } from './features/admin/pages/AdminProductVariants';

// In routing
<Route path="/admin/products/:id/variants" element={<AdminProductVariants />} />
```

**Accessing the page:**
- Navigate to `/admin/products/:productId/variants`
- Example: `/admin/products/1/variants`

---

### Variant Data Type
Location: `src/shared/types/index.ts`

```typescript
interface Variant {
  id: string;
  sku: string;
  color?: string;
  storage?: string;
  attributes: Record<string, string>;
  retailPrice: number;
  costPrice?: number;
  initialStock: number;
  currentStock: number;
  image?: string;
  isActive: boolean;
}
```

---

For more information, see [VARIANTS_MANAGEMENT.md](VARIANTS_MANAGEMENT.md), [ARCHITECTURE.md](ARCHITECTURE.md) and [README.md](README.md)
