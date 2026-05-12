# Swagger UI - JWT Token Authentication Guide

## Cách sử dụng Swagger UI với JWT Token

### 1. Truy cập Swagger UI
- **URL**: `http://localhost:8080/api/swagger-ui.html`
- **API Docs**: `http://localhost:8080/api/v3/api-docs`

### 2. Lấy JWT Token

#### Bước 1: Đăng nhập hoặc Đăng ký
1. Tìm endpoint `/auth/login` hoặc `/auth/register`
2. Click **"Try it out"**
3. Nhập thông tin username/password hoặc email/password
4. Click **"Execute"**
5. Sao chép **token** từ Response

**Example Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Sử dụng Token trong Swagger UI

#### Phương pháp 1: Qua nút "Authorize" (Khuyến nghị)
1. Tìm nút **"🔒 Authorize"** ở góc phải trên của Swagger UI
2. Click nó
3. Chọn **"bearerAuth"** 
4. Nhập token của bạn (chỉ dán chuỗi token, không cần thêm "Bearer ")
5. Click **"Authorize"**
6. Click **"Close"**
7. Từ đây, tất cả các request sẽ tự động gửi token trong header `Authorization: Bearer <token>`

#### Phương pháp 2: Thủ công qua Headers
1. Trong mỗi endpoint cần authentication
2. Click **"Try it out"**
3. Scroll xuống đến phần **"Headers"**
4. Thêm header:
   - **Key**: `Authorization`
   - **Value**: `Bearer <your_token>`
5. Thực hiện request

### 4. Các endpoint không cần Token (Public)

Những endpoint sau không yêu cầu JWT Token:
- `GET /products` - Xem danh sách sản phẩm
- `GET /brands` - Xem danh sách thương hiệu
- `GET /categories` - Xem danh sách danh mục
- `GET /product-variants` - Xem chi tiết các phiên bản sản phẩm
- `GET /suppliers` - Xem danh sách nhà cung cấp
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /orders` - Đặt hàng (không cần đăng nhập)
- `GET /orders/{id}` - Xem chi tiết đơn hàng (không cần đăng nhập)
- `POST /cart-items` - Thêm vào giỏ hàng (không cần đăng nhập)

### 5. Các endpoint cần Token (Authenticated)

- `PUT /users/{id}` - Cập nhật thông tin người dùng
- `GET /orders/user/{userId}` - Xem đơn hàng của user

### 6. Các endpoint chỉ Admin có thể truy cập (Admin Role)

Những endpoint này yêu cầu token của user có role **ADMIN**:
- `POST /products` - Tạo sản phẩm
- `PUT /products/{id}` - Cập nhật sản phẩm
- `DELETE /products/{id}` - Xóa sản phẩm
- `POST /brands` - Tạo thương hiệu
- `PUT /brands/{id}` - Cập nhật thương hiệu
- `DELETE /brands/{id}` - Xóa thương hiệu
- `POST /categories` - Tạo danh mục
- `PUT /categories/{id}` - Cập nhật danh mục
- `DELETE /categories/{id}` - Xóa danh mục
- `GET /users` - Xem danh sách người dùng
- `POST /users` - Tạo người dùng
- `DELETE /users/{id}` - Xóa người dùng
- `POST /import-orders` - Tạo đơn nhập hàng
- `/import-orders/**` - Quản lý đơn nhập hàng

### 7. Làm mới Token (Refresh Token)

Khi token hết hạn, bạn cần tạo token mới:
1. Tìm endpoint `/auth/refresh`
2. Sử dụng **refreshToken** từ đăng nhập
3. Lấy token mới từ response

### 8. Xử lý lỗi xác thực

#### 401 Unauthorized
- **Nguyên nhân**: Token không hợp lệ hoặc đã hết hạn
- **Giải pháp**: Đăng nhập lại để lấy token mới

#### 403 Forbidden
- **Nguyên nhân**: User không có sufficient permissions (ví dụ: cần ADMIN role)
- **Giải pháp**: Đăng nhập bằng tài khoản ADMIN

#### 400 Bad Request
- **Nguyên nhân**: Dữ liệu request không hợp lệ
- **Giải pháp**: Kiểm tra lại format của request body

### 9. Mỹ thuật Swagger Configuration

Cấu hình Swagger được đặt tại:
- **Java config**: `src/main/java/com/haui/techstore/config/OpenApiConfig.java`
- **Properties**: `src/main/resources/application.properties` (section 7)

Cấu hình bảo mật được đặt tại:
- `src/main/java/com/haui/techstore/config/SecurityConfig.java`

### 10. Chuẩn JWT Token Format

Token JWT có format: `xxxxx.yyyyy.zzzzz`

Ví dụ:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### 11. Troubleshooting

**Q: Token không hiển thị trong request?**
- A: Đảm bảo bạn đã click Authorize và token được lưu trữ (persist-authorization=true)

**Q: Authorize button không hiển thị?**
- A: Hãy kiểm tra OpenApiConfig.java đã được load. F5 refresh browser nếu cần.

**Q: 401 Unauthorized liên tục?**
- A: Token có thể hết hạn. Đăng nhập lại để lấy token mới.

**Q: Không thể đăng ký/đăng nhập?**
- A: Kiểm tra database connection và xem logs để tìm lỗi.

---

**Last Updated**: 2024
