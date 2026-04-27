# Database Schema - TechStore System

### 1. User & Logs (Hệ thống người dùng)
- **Users**: id (PK), email (unique), password, full_name, phone, address, role, status.
- **System_Logs**: id (PK), action, target_table, target_id, old_value, new_value, create_at, user_id (FK -> Users).

### 2. Product Domain (Quản lý sản phẩm)
- **Categories**: id (PK), name.
- **Suppliers**: id (PK), name, phone, address.
- **Products**: id (PK), name, description, brand_id, create_at, category_id (FK -> Categories), supplier_id (FK -> Suppliers).
- **Brand**: id (PK), name.
- **Product_Variants**: id (PK), color, price, stock_quantity, image_url, product_id (FK -> Products).

### 3. Inventory Management (Quản lý nhập kho)
- **Import_Order**: id (PK), import_date, total_cost, supplier_id (FK -> Suppliers), user_id (FK -> Users).
- **Import_Detail**: id (PK), quantity, import_price, import_order_id (FK -> Import_Order), variant_id (FK -> Product_Variants), supplier_id (FK -> Suppliers).

### 4. Sales & Orders (Bán hàng & Giỏ hàng)
- **Cart_Items**: id (PK), quantity, user_id (FK -> Users), variant_id (FK -> Product_Variants).
- **Orders**: id (PK), order_date, total_amount, status, shipping_address, payment_method, customer_name, phone, email, user_id (FK -> Users).
- **Order_Items**: id (PK), quantity, price_at_purchase, order_id (FK -> Orders), variant_id (FK -> Product_Variants).

### Relationships (Mối quan hệ chính)
- One-to-Many: Categories -> Products.
- One-to-Many: Products -> Product_Variants.
- One-to-Many: Users -> Orders.
- One-to-Many: Orders -> Order_Items.
- One-to-Many: Product_Variants -> Cart_Items.