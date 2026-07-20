# ShopAcc — Digital Account Commerce Demo

Full-stack demo mô phỏng một nền tảng quản lý và phân phối tài khoản game. Dự án được xây dựng để học tập, trình diễn kỹ thuật và sử dụng trong portfolio.

> [!WARNING]
> Đây chỉ là phiên bản demo, không tổ chức, hỗ trợ hoặc phục vụ hoạt động mua bán, trao đổi vật phẩm hay tài khoản game ngoài thực tế. Người sử dụng phải tuân thủ pháp luật hiện hành và điều khoản của nhà phát hành. Dữ liệu, tài khoản, số dư và giao dịch trong hệ thống đều là dữ liệu mô phỏng phục vụ học tập.

## Chức năng

### Người dùng

- Đăng ký, đăng nhập và quản lý hồ sơ.
- Xem danh mục, package và chi tiết tài khoản.
- Tìm kiếm, lọc, phân trang và lưu danh sách yêu thích.
- Mô phỏng mua tài khoản theo ba chế độ:
  - `LIST`: chọn tài khoản cụ thể.
  - `RANDOM`: nhận ngẫu nhiên một tài khoản trong package.
  - `CLONE`: chọn số lượng từ một kho credential.
- Xem lịch sử mua và thông tin tài khoản demo đã nhận.
- Xem thông báo hệ thống và giao diện theo mùa.

### Quản trị

- Quản lý người dùng, danh mục, package và tài khoản.
- Nhập tài khoản hàng loạt.
- Quản lý đơn hàng, giảm giá, thông báo và audit log.
- Theo dõi dashboard, doanh thu mô phỏng và trạng thái inventory.
- Cleanup dữ liệu/media cũ theo batch và lịch chạy định kỳ.

### Kỹ thuật nổi bật

- Conditional atomic updates chống bán trùng khi có request đồng thời.
- Compensating rollback phục hồi inventory và số dư khi purchase flow thất bại.
- JWT access/refresh token, HTTP-only cookie, token revocation và RBAC.
- Bcrypt, Joi validation, Helmet, rate limiting, sanitization và audit logging.
- Mongoose field projection giới hạn truy cập credential.
- Compound indexes, pagination, `insertMany`, `bulkWrite` và Cloudinary CDN.
- Next.js ISR/cache, optimized images và responsive admin dashboard.

## Những phần đã lược bỏ

Để repository có thể public an toàn, bản demo đã xoá:

- Cổng thanh toán, nạp thẻ và webhook xử lý tiền thật.
- PayOS và các tích hợp nhà cung cấp thanh toán.
- Thông tin liên hệ, mạng xã hội và QR cá nhân.
- Credential, API key và cấu hình production.

Các route giao diện liên quan chỉ hiển thị thông báo demo.

## Công nghệ

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query.
- Backend: Node.js, Express.js 5, MongoDB, Mongoose.
- Security: JWT, bcrypt, Joi, Helmet, rate limiting.
- Media: Cloudinary.

## Tài khoản demo

| Quyền | Email | Mật khẩu |
| --- | --- | --- |
| User | `test@gmail.com` | `12345678` |
| Admin | `admin@gmail.com` | `12345678` |

Chỉ sử dụng các thông tin này với database demo.

## Chạy local

Yêu cầu Node.js và MongoDB.

### Backend

```bash
cd BE
cp .env.example .env
npm install
npm run dev
```

Cập nhật `BE/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/shop-game-demo
JWT_ACCESS_SECRET=replace-with-a-random-secret
JWT_REFRESH_SECRET=replace-with-another-random-secret
FRONTEND_URL=http://localhost:3000
```

### Frontend

```bash
cd FE
npm install
npm run dev
```

Tạo `FE/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Frontend chạy tại `http://localhost:3000`, backend mặc định tại `http://localhost:3001`.

## Cấu trúc

```text
.
├── FE/   # Next.js application
└── BE/   # Express REST API
```

## Tác giả

Demo by `ngoctanz`.
