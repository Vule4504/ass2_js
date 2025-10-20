
# Susan Shop (json-server + Admin + Filters)

## Chạy API
npm i -g json-server
json-server --watch db.json --port 3000 --delay 400

## Mở giao diện
- index.html / products.html / product.html?id=101 / cart.html / thanks.html
- about.html / policy.html / contact.html
- admin.html (chỉ Admin)

## Tính năng mới
- Danh mục: xem sản phẩm theo danh mục (products.html?cat=ID), lọc theo danh mục + khoảng giá
- Giỏ hàng: tăng/giảm/xóa; **địa chỉ giao hàng chỉ hiện khi bấm "Tiếp tục thanh toán"**
- Quản trị: Quản lý Danh mục, Sản phẩm, Khách hàng, Đơn hàng; Thống kê (số lượng đặt, doanh thu, tồn kho)
- Sửa lỗi: Chỉ hiện thông báo "Đã thêm vào giỏ" khi user đã đăng nhập; đảm bảo hiển thị giỏ hàng ngay sau khi thêm.

## Đăng nhập
- Admin: admin@susan.vn / 123456
- User demo: user@susan.vn / 123456

## Đổi API (nếu cần)
localStorage.setItem('SUSAN_API','http://127.0.0.1:3000'); location.reload();
