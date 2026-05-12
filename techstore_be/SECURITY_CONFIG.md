# TechStore Security Configuration - Hướng Dẫn

## 📋 Tóm Tắt Cấu Hình

Hệ thống đã được cấu hình với JWT Authentication và Role-Based Authorization:

✅ **Khách không đăng nhập** có thể đặt hàng (`POST /orders`)  
✅ **Khách đã đăng nhập** có thể sửa thông tin cá nhân (`PUT /users/{id}`)  
✅ **Admin** có quyền quản lý tất cả API (Brand, Category, Product, User...)

---

## 🔧 Các Thành Phần Được Tạo

### 1. **JwtUtil.java** - JWT Token Management
- Tạo token với userId và role
- Validate token
- Trích xuất thông tin từ token

### 2. **JwtAuthenticationFilter.java** - Request Filter
- Lắng nghe từng request
- Trích xuất token từ Authorization header
- Validate token và set SecurityContext

### 3. **JwtAuthenticationEntryPoint & JwtAccessDeniedHandler**
- Xử lý lỗi 401 (Unauthorized)
- Xử lý lỗi 403 (Forbidden)
- Trả về JSON response

### 4. **SecurityConfig.java** - Security Configuration
- Kích hoạt method-level security (@PreAuthorize)
- Thêm JWT filter vào security chain
- Định nghĩa URL-based authorization

### 5. **AuthenticationController.java** - Auth APIs
- `/auth/register` - Đăng ký
- `/auth/login` - Đăng nhập
- `/auth/refresh` - Refresh token

---

## 🔐 Authorization Rules

### 📖 Public Endpoints (Không cần đăng nhập)

**Authentication:**
```
POST /auth/register
POST /auth/login
```

**Browsing Products:**
```
GET /products/**
GET /brands/**
GET /categories/**
GET /product-variants/**
GET /suppliers/**
```

**Orders (Khách không cần đăng nhập):**
```
POST /orders                    --> Đặt hàng
GET /orders/{id}               --> Xem chi tiết đơn hàng
```

**Shopping Cart:**
```
GET /cart-items/**
POST /cart-items
PUT /cart-items/**
DELETE /cart-items/**
```

### 👤 User Authenticated (cần đăng nhập)

```
PUT /users/{id}                --> Sửa thông tin cá nhân
GET /orders/user/{userId}      --> Xem đơn hàng của mình
```

### 🛡️ Admin Only (ROLE_ADMIN)

**User Management:**
```
GET /users                     --> Xem danh sách users
GET /users/all
POST /users                    --> Tạo user mới
DELETE /users/{id}            --> Xóa user
```

**Product Management:**
```
POST /products
PUT /products/{id}
DELETE /products/{id}
```

**Brand Management:**
```
POST /brands
PUT /brands/{id}
DELETE /brands/{id}
```

**Category Management:**
```
POST /categories
PUT /categories/{id}
DELETE /categories/{id}
```

**Product Variant Management:**
```
POST /product-variants
PUT /product-variants/{id}
DELETE /product-variants/{id}
```

**Supplier Management:**
```
POST /suppliers
PUT /suppliers/{id}
DELETE /suppliers/{id}
```

**Import Orders:**
```
Tất cả endpoints /import-orders/** --> Chỉ ADMIN
```

**Order Management (Advanced):**
```
PUT /orders/{id}               --> Chỉnh sửa đơn hàng (ADMIN only)
DELETE /orders/{id}            --> Xóa đơn hàng (ADMIN only)
```

---

## 📝 API Usage Examples

### 1️⃣ Đăng Ký User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "fullName": "John Doe"
  }'
```

**Response:**
```json
{
  "code": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "USER",
      "status": "ACTIVE"
    },
    "token": "eyJhbGciOiJIUzUxMiJ9..."
  }
}
```

### 2️⃣ Đăng Nhập

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzUxMiJ9..."
  }
}
```

### 3️⃣ Đặt Hàng (Không cần đăng nhập)

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": "123 Main St",
    "phoneNumber": "0123456789"
  }'
```

**Notes:**
- Endpoint này **PUBLIC** - khách hàng không cần token
- Khách hàng có thể là người dùng của hệ thống hoặc khách vãng lai

### 4️⃣ Sửa Thông Tin Cá Nhân (Cần đăng nhập)

```bash
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -d '{
    "fullName": "Jane Doe",
    "phone": "0987654321",
    "address": "456 Oak Ave"
  }'
```

### 5️⃣ Xem Đơn Hàng Của Mình (Cần đăng nhập)

```bash
curl -X GET "http://localhost:8080/api/orders/user/1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

### 6️⃣ Tạo Brand (ADMIN only)

```bash
curl -X POST http://localhost:8080/api/brands \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..." \
  -d '{
    "name": "Samsung",
    "description": "Electronics brand"
  }'
```

**Error nếu không phải ADMIN:**
```json
{
  "code": 403,
  "message": "Forbidden: You don't have permission to access this resource",
  "data": null
}
```

### 7️⃣ Refresh Token

```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

**Response:**
```json
{
  "code": 200,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9..."
  }
}
```

---

## 🔑 Token Usage

Để sử dụng bất kỳ endpoint nào yêu cầu authentication, thêm header:

```
Authorization: Bearer <your_jwt_token>
```

**Ví dụ:**
```bash
-H "Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwianRpIjoiMTIzIi..."
```

---

## ⚙️ Configuration In application.properties

```properties
# JWT Configuration
jwt.secret=yeuyyyrrreehuyennhat
jwt.expiration=86400000          # 24 hours
jwt.refresh-expiration=604800000  # 7 days
```

---

## 🧪 Testing

### Sử dụng Postman hoặc Swagger UI

1. Vào `http://localhost:8080/api/swagger-ui.html`
2. Các endpoint public không cần setup
3. Cho các endpoint auth-required:
   - Đăng nhập trước
   - Copy token từ response
   - Click "Authorize" button ở phía trên
   - Paste token
   - Test endpoint

---

## 🚨 Common Errors

| Error | Nguyên Nhân | Giải Pháp |
|-------|-----------|---------|
| 401 Unauthorized | Token không hợp lệ/hết hạn | Login lại để lấy token mới |
| 403 Forbidden | Không đủ quyền (không phải ADMIN) | Kiểm tra role của user |
| 400 Bad Request | Email đã tồn tại khi đăng ký | Sử dụng email khác |
| 404 Not Found | User/Order không tồn tại | Kiểm tra ID |

---

## 📚 File Structure

```
src/main/java/com/haui/techstore/
├── config/
│   ├── SecurityConfig.java              ← Main security configuration
│   ├── JwtAuthenticationFilter.java
│   ├── JwtAuthenticationEntryPoint.java
│   └── JwtAccessDeniedHandler.java
├── controller/
│   └── AuthenticationController.java    ← Login/Register endpoints
├── util/
│   └── JwtUtil.java                     ← JWT token management
└── service/
    ├── UserService.java                 ← Updated interface
    └── impl/
        └── UserServiceImpl.java          ← Updated implementation
```

---

## ✅ Summary

✨ **Hệ thống đã sẵn sàng:**
- Khách không cần đăng nhập vẫn có thể xem sản phẩm và đặt hàng
- User đã đăng nhập có thể sửa profile, xem đơn hàng
- Admin có quyền quản lý toàn bộ hệ thống
- Tất cả endpoints được bảo vệ bằng JWT token

---

**Cần hỗ trợ thêm?** Kiểm tra Swagger UI: http://localhost:8080/api/swagger-ui.html
