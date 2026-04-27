# API Integration Testing Guide

## 📋 Kiểm tra trước khi test

### 1. Kiểm tra cấu hình Backend
```bash
cd e:\DATN\Techstore\techstore_be

# Verify environment variables hoặc application.properties
# Đảm bảo database credentials đúng
```

### 2. Kiểm tra cấu hình Frontend
```bash
cd e:\DATN\Techstore\techstore_fe

# Verify .env.local
cat .env.local

# Expected content:
# VITE_API_URL=http://localhost:8080/api
```

## 🚀 Chạy dự án

### Method 1: Sử dụng Maven (Backend)

```bash
cd e:\DATN\Techstore\techstore_be

# Option 1: Dùng Maven Wrapper
./mvnw spring-boot:run

# Option 2: Dùng Maven command
mvn spring-boot:run

# Option 3: Chạy trực tiếp batch file (nếu có)
./run-aiven.bat
```

### Method 2: Sử dụng IDE (IntelliJ IDEA - Recommend)

1. Mở project `techstore_be` trong IntelliJ
2. Right-click on Main class → Run
3. Backend sẽ start trên `http://localhost:8080`

### Method 3: Sử dụng npm (Frontend)

```bash
cd e:\DATN\Techstore\techstore_fe

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend sẽ start trên `http://localhost:5173`
```

## ✅ Kiểm tra API hoạt động

### Option 1: Dùng Browser Console

1. Mở Frontend: `http://localhost:5173`
2. Bật DevTools: F12 → Console tab
3. Chạy command:

```javascript
// Test GET /api/brands
fetch('http://localhost:8080/api/brands', {
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log('Response Status:', response.status);
    console.log('Headers:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Content-Type': response.headers.get('Content-Type')
    });
    return response.json();
  })
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
```

**Expected Output:**
```javascript
Response Status: 200
Headers: {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Content-Type': 'application/json'
}
Success: {
  status: 200,
  message: "Brands retrieved successfully",
  data: []  // hoặc list of brands
}
```

### Option 2: Dùng cURL (Backend test)

```bash
# Test CORS preflight
curl -X OPTIONS http://localhost:8080/api/brands \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Expected response headers:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS,HEAD,PATCH
# Access-Control-Allow-Headers: *

# Test actual GET request
curl -X GET http://localhost:8080/api/brands \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -v
```

### Option 3: Dùng Postman

1. Import Backend URL: `http://localhost:8080/api`
2. Create new request:
   - Method: GET
   - URL: `{{base_url}}/brands`
   - Headers:
     - `Content-Type: application/json`
     - `Origin: http://localhost:5173` (optional)
3. Send request → Check response

### Option 4: Dùng Swagger UI

1. Mở: `http://localhost:8080/swagger-ui.html`
2. Tìm "Brand Management" section
3. Click "GET /api/brands"
4. Click "Try it out" → "Execute"
5. Xem response

## 🔍 Debugging CORS Errors

### Nếu vẫn gặp lỗi CORS:

1. **Mở DevTools (F12) → Network tab**
   - Xem OPTIONS request response
   - Check `Access-Control-Allow-Origin` header

2. **Xem Browser Console**
   - Tìm CORS error messages
   - Ví dụ: "Access to XMLHttpRequest at 'http://localhost:8080/api/brands' from origin 'http://localhost:5173' has been blocked by CORS policy"

3. **Xem Backend Logs**
   - Search for CORS-related messages
   - Check if `WebConfig.addCorsMappings()` được gọi

4. **Verify Network Connectivity**
   ```bash
   # Ping backend
   ping localhost:8080
   
   # Test connection
   curl -I http://localhost:8080/api/brands
   ```

## 📊 Network Flow Verification

### Expected Request/Response Flow:

```
1. Browser → OPTIONS /api/brands
   Response Headers:
   - Access-Control-Allow-Origin: http://localhost:5173
   - Access-Control-Allow-Methods: GET,POST,PUT,DELETE,...
   - Access-Control-Allow-Headers: *
   Status: 200

2. Browser → GET /api/brands
   Request Headers:
   - Origin: http://localhost:5173
   - Content-Type: application/json
   
   Response:
   - Status: 200
   - Body: {status: 200, message: "...", data: [...]}
   - Headers: Access-Control-Allow-Origin header present
```

## 🧪 Test API Endpoints

### 1. Brands API

```javascript
// GET all brands
fetch('http://localhost:8080/api/brands')
  .then(r => r.json())
  .then(d => console.log(d))

// GET brand by ID
fetch('http://localhost:8080/api/brands/1')
  .then(r => r.json())
  .then(d => console.log(d))

// POST create brand (Admin only)
fetch('http://localhost:8080/api/brands', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    name: 'Test Brand',
    description: 'Test Description',
    logoUrl: 'https://example.com/logo.png'
  })
})
  .then(r => r.json())
  .then(d => console.log(d))
```

### 2. Products API

```javascript
// GET all products
fetch('http://localhost:8080/api/products')
  .then(r => r.json())
  .then(d => console.log(d))

// GET products by brand
fetch('http://localhost:8080/api/products/brand/1')
  .then(r => r.json())
  .then(d => console.log(d))
```

### 3. Categories API

```javascript
// GET all categories
fetch('http://localhost:8080/api/categories')
  .then(r => r.json())
  .then(d => console.log(d))
```

## 📝 Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| CORS Error | "blocked by CORS policy" | Check WebConfig CORS setup |
| 500 Error | Server error in response | Check Backend logs |
| Connection refused | "Failed to fetch" | Verify Backend running on :8080 |
| Wrong API URL | 404 errors | Check `.env.local` VITE_API_URL |
| Port already in use | "Address already in use" | Kill process on :8080 atau :5173 |
| Database connection | Database error in logs | Verify DB credentials in application.properties |
| JWT errors | 401 Unauthorized | Ensure valid token in Authorization header |

## 🎯 Success Criteria

✅ API integration sửa lỗi 500 successfully nếu:

1. **Frontend → Backend connectivity works**
   - Frontend trên localhost:5173 kết nối được tới Backend trên localhost:8080

2. **CORS headers present**
   - Response chứa `Access-Control-Allow-Origin`
   - Response chứa `Access-Control-Allow-Methods`

3. **API endpoints respond correctly**
   - GET /api/brands → Status 200 + data
   - POST /api/brands → Status 201 + created data (if authenticated)
   - PUT /api/brands/{id} → Status 200 (if authenticated)
   - DELETE /api/brands/{id} → Status 200 (if authenticated)

4. **No error logs**
   - Backend logs không có exception/error
   - Browser console không có error messages

## 📞 Next Steps

1. Chạy backend và frontend theo instructions trên
2. Test API endpoints dùng methods trên
3. Nếu vẫn có lỗi, check logs và troubleshooting section
4. Verify tất cả connections đang hoạt động

---

**Note:** Nếu vẫn gặp vấn đề, hãy check:
- Backend logs (Spring Boot console output)
- Browser DevTools → Console + Network tabs
- application.properties database configuration
- .env.local frontend configuration
