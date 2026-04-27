import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './shared/context/CartContext';
import { AuthProvider } from './shared/context/AuthContext';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { ProductsPage } from './features/products/pages/ProductsPage';
import ProductDetailsPage from './features/products/pages/ProductDetailsPage';
import CartPage from './features/cart/pages/CartPage';
import CheckoutPage from './features/checkout/pages/CheckoutPage';
import { OrderTrackingPage, OrdersPage } from './features/orders/pages';
import { AdminDashboard } from './features/admin/pages/AdminDashboard';
import { AdminProducts } from './features/admin/pages/AdminProducts';
import { AdminBrands } from './features/admin/pages/AdminBrands';
import { AdminSuppliers } from './features/admin/pages/AdminSuppliers';
import { AdminInventoryInflow } from './features/admin/pages/AdminInventoryInflow';
import { AdminProductVariants } from './features/admin/pages/AdminProductVariants';
import { AdminOrders } from './features/admin/pages/AdminOrders';
import { AdminUsers } from './features/admin/pages/AdminUsers';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './features/auth/pages';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Public Routes */}
            <Route path="/" element={<ProductsPage />} />
            <Route path="/products/laptops" element={<ProductsPage />} />
            <Route path="/products/mobile" element={<ProductsPage />} />
            <Route path="/products/accessories" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/order-tracking" element={<OrderTrackingPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/:id/variants"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminProductVariants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/brands"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminBrands />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/suppliers"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminSuppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inventory-inflow"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminInventoryInflow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
