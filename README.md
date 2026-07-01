# 📦 Hệ thống Quản lý Kho - Inventory Management System

Hệ thống quản lý kho hàng toàn diện được xây dựng bằng [Next.js](https://nextjs.org), hỗ trợ đa ngôn ngữ (Tiếng Việt & English) và tích hợp AI Chat Assistant.

## ✨ Tính năng chính

### 📊 Quản lý Hàng hóa (Products)
- ✅ Thêm, sửa, xóa sản phẩm
- ✅ Quản lý hình ảnh sản phẩm
- ✅ Phân loại theo danh mục và thương hiệu
- ✅ Theo dõi tồn kho theo từng kho
- ✅ Quản lý giá vốn và giá bán
- ✅ Rich text editor cho mô tả sản phẩm (Lexical)
- ✅ Lọc và tìm kiếm nâng cao
- ✅ Xuất dữ liệu ra CSV

### 🏪 Quản lý Bán hàng (Sales)
- ✅ Giao diện POS (Point of Sale) trực quan
- ✅ Tìm kiếm khách hàng nhanh
- ✅ Quản lý giỏ hàng
- ✅ Áp dụng giảm giá
- ✅ Hỗ trợ bán hàng giao tận nơi
- ✅ In hóa đơn
- ✅ Nhiều phương thức thanh toán

### 📋 Quản lý Đơn hàng (Orders)
- ✅ Tạo và theo dõi đơn hàng
- ✅ Quản lý trạng thái đơn hàng
- ✅ Lịch sử đơn hàng chi tiết
- ✅ Đơn đặt hàng trước (Pre-order)

### 🧾 Quản lý Hóa đơn (Invoices)
- ✅ Tạo và quản lý hóa đơn
- ✅ Theo dõi thanh toán
- ✅ In và xuất hóa đơn
- ✅ Lịch sử giao dịch

### 👥 Quản lý Đối tác
- **Khách hàng (Customers)**
  - ✅ Quản lý thông tin khách hàng
  - ✅ Lịch sử mua hàng
  - ✅ Công nợ và thanh toán
  
- **Nhà cung cấp (Suppliers)**
  - ✅ Quản lý thông tin nhà cung cấp
  - ✅ Lịch sử nhập hàng
  - ✅ Theo dõi công nợ

### 📦 Quản lý Kho (Warehouses)
- ✅ Quản lý nhiều kho
- ✅ Theo dõi tồn kho từng kho
- ✅ Xuất nhập kho
- ✅ Lịch sử giao dịch kho

### 📂 Quản lý Danh mục (Categories & Brands)
- ✅ Phân loại sản phẩm theo danh mục
- ✅ Quản lý thương hiệu
- ✅ Cấu trúc danh mục linh hoạt

### 🤖 AI Chat Assistant
- ✅ Trợ lý AI tích hợp (powered by OpenAI)
- ✅ Hỗ trợ trả lời câu hỏi về sản phẩm
- ✅ Chat widget tiện lợi

### 🌐 Tính năng khác
- ✅ Đa ngôn ngữ (Tiếng Việt / English)
- ✅ Xác thực và phân quyền người dùng
- ✅ Multi-tenant support
- ✅ Responsive design
- ✅ Dark/Light mode
- ✅ Dashboard với biểu đồ thống kê

## 🚀 Cách chạy project

### Yêu cầu hệ thống
- Node.js 18+ 
- npm, yarn, pnpm hoặc bun

### Cài đặt

1. **Clone repository**
```bash
git clone https://github.com/nmduc99/inventory-management.git
cd inventory-management
```

2. **Cài đặt dependencies**
```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

3. **Cấu hình biến môi trường**
Tạo file `.env.local` và cấu hình các biến môi trường cần thiết:
```env
# API Configuration
NEXT_PUBLIC_API_URL=your_api_url

# Authentication
NEXT_PUBLIC_AUTH_SECRET=your_auth_secret

# OpenAI API (cho Chat Assistant)
OPENAI_API_KEY=your_openai_api_key

# Other configurations...
```

4. **Chạy development server**
```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
# hoặc
bun dev
```

5. **Mở trình duyệt**
Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng

### Build cho production

```bash
npm run build
npm run start
```

## 🛠️ Công nghệ sử dụng

- **Framework:** Next.js 15.5.0 (App Router)
- **Language:** TypeScript
- **UI Components:** Radix UI
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Charts:** Chart.js
- **Rich Text Editor:** Lexical
- **Form Validation:** React Hook Form + Zod
- **Internationalization:** next-intl
- **Authentication:** JWT (jsonwebtoken)
- **AI Integration:** OpenAI API
- **Icons:** Lucide React

## 📁 Cấu trúc thư mục

```
inventory-management/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   │   ├── products/      # Quản lý sản phẩm
│   │   ├── sale/          # POS bán hàng
│   │   ├── order/         # Quản lý đơn hàng
│   │   ├── invoice/       # Quản lý hóa đơn
│   │   ├── customers/     # Quản lý khách hàng
│   │   ├── suppliers/     # Quản lý nhà cung cấp
│   │   ├── warehouse/     # Quản lý kho
│   │   ├── category/      # Quản lý danh mục
│   │   └── ...
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── product/          # Product components
│   ├── sale/             # Sales components
│   └── ...
├── lib/                  # Utilities & helpers
├── types/                # TypeScript type definitions
├── languages/            # Internationalization files
│   ├── vi.json          # Tiếng Việt
│   └── en.json          # English
├── hooks/                # Custom React hooks
└── public/               # Static assets
```

## 🌍 Đa ngôn ngữ

Hệ thống hỗ trợ 2 ngôn ngữ:
- 🇻🇳 Tiếng Việt (vi)
- 🇬🇧 English (en)

Chuyển đổi ngôn ngữ thông qua dropdown trong header.

## 📝 License

Private project - All rights reserved

## 👥 Contributors

- **Owner:** [nmduc99](https://github.com/nmduc99)

## 📞 Liên hệ & Hỗ trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub repository.

---

Made with ❤️ using Next.js
