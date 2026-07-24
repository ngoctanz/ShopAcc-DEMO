# Shop Game 2.0 — Frontend

Giao diện web bán tài khoản game, hỗ trợ mua tài khoản thường/ngẫu nhiên, nạp tiền, quản lý tài khoản người dùng và trang quản trị. Dự án sử dụng Next.js App Router và kết nối tới REST API riêng.

Đây là dự án demo mô phỏng quy trình vận hành của một shop tài khoản game: người dùng duyệt sản phẩm, mua tài khoản, quản lý giao dịch; quản trị viên theo dõi và quản lý dữ liệu trên dashboard. Dự án tập trung trình diễn giao diện, trải nghiệm người dùng và cách tổ chức frontend, không phải hệ thống thương mại điện tử hoàn chỉnh để sử dụng trong production.

## Demo

### Trang chủ

![Trang chủ Shop Game](public/images/demo/Screenshot%20From%202026-07-24%2016-50-37.png)

### Giao diện theo mùa và dark mode

| Tết | Trung thu |
| --- | --- |
| ![Giao diện Tết](public/images/demo/Screenshot%20From%202026-07-24%2016-50-44.png) | ![Giao diện Trung thu](public/images/demo/Screenshot%20From%202026-07-24%2016-51-06.png) |

### Mua tài khoản

![Chi tiết tài khoản](public/images/demo/Screenshot%20From%202026-07-24%2016-52-03.png)

### Quản trị

![Dashboard quản trị](public/images/demo/Screenshot%20From%202026-07-24%2016-52-26.png)

## Tính năng chính

- Đăng ký, đăng nhập, quên mật khẩu và đồng bộ phiên đăng nhập.
- Xem danh mục, chi tiết, tìm kiếm và mua tài khoản game.
- Mua tài khoản ngẫu nhiên, vòng quay/lì xì may mắn.
- Danh sách yêu thích, lịch sử mua hàng, nạp tiền và lịch sử nạp.
- Giao diện sáng/tối, responsive và hiệu ứng theo mùa.
- Dashboard quản lý người dùng, tài khoản, danh mục, đơn hàng, nạp tiền, mã giảm giá, thông báo và nhật ký hệ thống.
- Nhập dữ liệu tài khoản từ Excel, biểu đồ thống kê và phân trang.

## Giới hạn hiện tại

- Một số tính năng đã được rút gọn hoặc chỉ dùng dữ liệu demo.
- Thanh toán qua PayOS đang tạm thời bị loại bỏ.
- Cập nhật thời gian thực qua WebSocket đang tạm thời bị loại bỏ.
- Một số luồng cần backend API tương ứng mới hoạt động đầy đủ.
- Chưa phù hợp để xử lý giao dịch thật hoặc triển khai production.

## Công nghệ sử dụng

- **Framework:** Next.js 16, React 19, TypeScript 5.
- **Giao diện:** Tailwind CSS 4, Radix UI, Tabler Icons, Lucide React.
- **Dữ liệu:** TanStack Query, TanStack Table.
- **Form & validation:** React Hook Form, Zod.
- **Biểu đồ & tiện ích:** Recharts, SheetJS, QRCode React, dnd-kit, date-fns.
- **Chất lượng code:** Biome, TypeScript.

## Yêu cầu

- Node.js `20.9+`.
- npm.
- Backend API đang chạy và cho phép frontend truy cập. Cấu hình mặc định: `http://localhost:3001/v1`.

## Cài đặt và chạy

```bash
git clone <repository-url>
cd FE
npm install
cp .env.example .env.local
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

Nếu backend chạy ở địa chỉ khác, cập nhật `NEXT_PUBLIC_API_URL` trong `.env.local`.

## Biến môi trường

| Biến | Mặc định | Mô tả |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` | `ShopAcc Demo` | Tên ứng dụng |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | URL frontend |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | URL website dùng cho SEO |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/v1` | Base URL của backend API |
| `NEXT_PUBLIC_API_TIMEOUT` | `30000` | Thời gian chờ API, đơn vị mili giây |
| `NEXT_PUBLIC_MAX_IMAGE_SIZE` | `5242880` | Kích thước ảnh tải lên tối đa, đơn vị byte (tùy chọn) |

Không commit `.env.local` hoặc thông tin nhạy cảm lên Git.

## Scripts

| Lệnh | Chức năng |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` | Build bản production |
| `npm start` | Chạy bản production đã build |
| `npm run lint` | Kiểm tra code bằng Biome |
| `npm run lint:fix` | Tự động sửa các lỗi Biome hỗ trợ |
| `npm run format` | Format code |
| `npm run type-check` | Kiểm tra TypeScript |
| `npm run check` | Chạy lint và type-check |
| `npm run clean` | Xóa `.next` và `node_modules` |

## Thông số mặc định

| Hạng mục | Giá trị |
| --- | --- |
| Frontend port | `3000` |
| Backend API port | `3001` |
| API timeout | `30 giây` |
| Số bản ghi mỗi trang | `20` |
| Tùy chọn số bản ghi | `10`, `20`, `50`, `100` |
| Ảnh hỗ trợ | JPEG, PNG, WebP |
| Kích thước ảnh tối đa | `5 MB` |
| Build output | Next.js standalone |

## Build production

```bash
npm run check
npm run build
npm start
```

Ứng dụng production mặc định chạy tại [http://localhost:3000](http://localhost:3000).

## Cấu trúc chính

```text
src/
├── app/          # Routes, layouts và pages
├── components/   # UI dùng lại, form, modal và dashboard
├── sections/     # Các khối giao diện theo tính năng
├── services/     # Hàm gọi backend API
├── contexts/     # Trạng thái dùng chung
├── hooks/        # Custom React hooks
├── lib/          # Fetch client, SEO và helper chung
├── constants/    # Routes và cấu hình ứng dụng
├── types/        # Kiểu dữ liệu TypeScript
└── utils/        # Hàm tiện ích
```
