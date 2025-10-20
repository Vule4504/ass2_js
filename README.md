# Susan Shop (mini)

This is a small front-end project for a mock e-commerce store (Susan Shop).
It uses a json-server-like REST API (default: http://localhost:3000) to store data in `db.json`.

Features mapping (Y1–Y10):

- Y1: Danh mục sản phẩm

  - Admin can create/edit/delete categories in `admin.html` (tab "Danh mục").
  - Categories are stored in `db.json` under `categories`.

- Y2: Sản phẩm

  - Products are visible on `products.html` and `product.html`.
  - Admin can create/edit/delete products in `admin.html` (tab "Sản phẩm").
  - Fields: id, name, price, image, desc, categoryId, stock, specs.

- Y3: Khách hàng

  - Users are listed in admin `admin.html` (tab "Khách hàng").
  - Authentication is simple: login/register via modal; session stored in localStorage.
  - Default users are in `db.json`.

- Y4: Đơn hàng

  - Orders are created on checkout (`cart.html`) via `SUSAN.createOrder` and stored in `db.json` under `orders`.
  - Admin can view orders and change status in `admin.html` (tab "Đơn hàng").

- Y5: Thống kê số lượng sản phẩm đặt mua

  - Admin -> Thống kê shows "Số lượng sản phẩm được đặt" (total items ordered).
  - `assets/app.js` computes per-product sold quantities in `getSalesSummary()`.

- Y6: Thống kê doanh thu

  - Admin -> Thống kê shows "Doanh thu" computed from orders in `getSalesSummary()`.

- Y7: Thống kê hàng tồn

  - Admin -> Thống kê shows top inventory items (remaining stock after subtracting sold).

- Y8: Nhập thêm số lượng tồn

  - Admin -> Sản phẩm now has an extra "Nhập" button to open a modal and add stock.
  - This updates product `stock` via PATCH to `/products/:id`.

- Y9: Giao diện + dữ liệu

  - All pages render header/footer via `assets/app.js` (SUSAN.renderHeader/renderFooter).
  - Cart stored in localStorage per-user.

- Y10: README.md
  - This file.

How to run (development):

1. Install `json-server` globally (or locally):

   npm install -g json-server

2. From project folder (`c:\Users\thanh\js\ass2_js`) run:

   json-server --watch db.json --port 3000

   (If port 3000 is busy, pick another port and set the API url in browser devtools with `localStorage.setItem('SUSAN_API','http://localhost:PORT')`)

3. Open `index.html` in your browser (or serve the folder with a static server).

Notes and verification:

- Admin account: `admin@susan.vn` / `123456` (in `db.json`). Login using the header modal.
- After logging in as admin, visit `admin.html` to manage categories, products, users, orders, and stats.
- The stock "Nhập" button opens a modal to add more stock to a product; changes are persisted to `db.json` by json-server.

Potential improvements (optional):

- Add validation on product forms for image URLs and specs input.
- Support decrementing stock automatically when orders are created.
- Add search and pagination for products.

If you want, I can also:

- Wire automatic stock decrement on order creation.
- Add CSV export for stats.
- Create small unit tests for the JS helpers.

---

Generated: October 2025
