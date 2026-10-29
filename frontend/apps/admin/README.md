# Lái Hộ Admin

Web quản trị tiếng Việt, màu chủ đạo `#800000`, dùng React/TypeScript, Vite, Ant Design, React Router, TanStack Query và Firebase Web SDK. Ứng dụng độc lập với các gói React Native.

## Chạy local

Tại thư mục `frontend`:

```powershell
pnpm install
Copy-Item apps/admin/.env.example apps/admin/.env.local
# Điền Firebase Web config và VITE_API_BASE_URL trong .env.local.
pnpm admin
```

Mở http://localhost:5173. Nếu cổng đã có ứng dụng khác, Vite sẽ thông báo cổng thay thế; thêm origin đó vào CORS của backend khi cần. Khởi động lại Vite sau khi đổi môi trường.

Biến môi trường:

| Biến                        | Ý nghĩa                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `VITE_API_BASE_URL`         | Origin backend, ví dụ `http://localhost:8080`, không thêm `/api` |
| `VITE_FIREBASE_API_KEY`     | Firebase Web API key                                             |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain của Firebase project                                 |
| `VITE_FIREBASE_PROJECT_ID`  | Firebase project ID                                              |
| `VITE_FIREBASE_APP_ID`      | Firebase Web app ID                                              |

Chỉ dùng Web config ở frontend; không sao chép service account, private key hoặc Firebase Admin credentials. `.env.local` không được đưa vào Git.

## Chuẩn bị backend và tài khoản

1. Bật Email/Password trong Firebase Authentication của cùng project với backend.
2. Tạo Firebase user quản trị và thiết lập mật khẩu qua Firebase Console.
3. Điền UID/email/tên vào `BOOTSTRAP_ADMIN_FIREBASE_UID`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_FULL_NAME` của backend rồi khởi động backend. UID chưa được liên kết với customer/driver.
4. Tài khoản admin phải có trạng thái `ACTIVE`. Web không có đăng ký hoặc tự cấp quyền.
5. Backend, PostgreSQL, Redis và Firebase phải sẵn sàng. CORS backend mặc định đã cho phép `http://localhost:5173`; thêm origin thực tế vào `APP_CORS_ALLOWED_ORIGINS` nếu khác.

Firebase giữ phiên trong tab hiện tại. Sau đăng nhập, web kiểm tra `/api/auth/admin/login`; khi tải lại kiểm tra `/api/auth/me`. Đăng xuất luôn xóa phiên Firebase và query cache, kể cả khi API logout thất bại. Backend hiện không thu hồi ID token của admin qua logout.

## Kiểm tra và build

```powershell
pnpm --filter admin typecheck
pnpm --filter admin lint
pnpm admin:test
pnpm admin:build
pnpm --filter admin preview
```

Build nằm trong `apps/admin/dist`. Nếu triển khai sau này, hosting cần phục vụ `index.html` cho các đường dẫn SPA như `/rides/123`, dùng HTTPS và cấu hình đúng CORS/Firebase. Phạm vi bàn giao hiện tại chỉ local + production build.

## Chức năng và giới hạn

- Đủ 23 endpoint `/api/admin`: chuyến (5), tài xế/giấy tờ/kỹ năng (7), khách hàng (6), bảng giá (5), cùng `/api/location/nearby-drivers` và xác thực.
- Tổng quan lấy số đếm từ `totalElements` của API, không suy ra từ trang dữ liệu. Không có báo cáo doanh thu hoặc thống kê theo ngày.
- Danh sách/bộ lọc/tab lưu trên URL. Trang hiển thị từ 1, backend từ 0; kích thước 20/50/100.
- Chuyến/tổng quan cập nhật 30 giây, chat 10 giây khi mở; dừng khi tab ẩn. Chat chỉ đọc, tải tin cũ bằng cursor, không gửi tin hoặc thay trạng thái đọc.
- Tài xế gần điểm đón: bán kính mặc định 5km, tối đa 20 kết quả, tối đa bốn yêu cầu hồ sơ đồng thời. Tìm tên/SĐT là phương án khác. Backend kiểm tra điều kiện nhận chuyến cuối cùng.
- Lọc tài xế `online=true` của backend bao gồm cả tài xế bận; giao diện phân biệt bằng trạng thái. Không coi kết quả gần vị trí là đảm bảo nhận chuyến.
- Gán lại chỉ cho trạng thái được hỗ trợ, backend kiểm tra mất liên lạc. Không có API heartbeat admin hoặc WebSocket dành cho admin.
- Hủy, ép offline, thay giá active và tắt cưỡng chế có xác nhận. Thao tác ghi không tự động thử lại.
- Từ chối giấy tờ cần lý do; duyệt tài khoản và xác minh kỹ năng là thao tác riêng. Danh sách giấy tờ bắt buộc do backend cấu hình.
- `BANNED` hủy chuyến `PENDING`/`SEARCHING`; không có thao tác chỉnh số dư ví, gửi chat, chỉnh hồ sơ hoặc quản lý voucher.
- Ảnh nghiệp vụ chỉ hiển thị URL HTTPS. Giá định dạng VND; thời gian có offset chuyển sang múi giờ Việt Nam, ngày thuần và LocalDateTime không tự thêm offset.

Kiểm thử tự động dùng dữ liệu giả trong các tệp test; ứng dụng chạy bình thường chỉ gọi API thật. Kiểm thử đầy đủ với Firebase/backend thật cần cấu hình môi trường và tài khoản đã được cấp quyền.
