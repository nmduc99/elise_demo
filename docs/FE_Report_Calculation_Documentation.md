# Tài liệu chi tiết: Cách FE tính toán các Báo cáo (Reports)
> **Ngày tạo**: 2026-02-26

---

## Tổng quan kiến trúc hiện tại

### Luồng dữ liệu hiện tại (FE tính toán)

```
User chọn Filter → FE gọi Next.js API Route (/api/reports/*)
→ API Route gọi nhiều Backend API (invoices, payments, products, returns, etc.)
→ API Route tổng hợp, lọc, tính toán → Trả về dữ liệu đã xử lý cho Component hiển thị
```

### Backend API được sử dụng (Base URL: `NEXT_PUBLIC_API_URL` hoặc `https://api.dev.bmgqly.com/api`)

| API Endpoint                  | Constant name       | Mô tả                                    |
|-------------------------------|----------------------|-------------------------------------------|
| `/sales/invoices`             | `SALES_INVOICES`     | Hóa đơn bán hàng                         |
| `/sales/returns`              | `SALES_RETURNS`      | Trả hàng bán (khách trả)                 |
| `/sales/orders`               | `SALES_ORDERS`       | Đơn đặt hàng bán                         |
| `/finance/payments`           | `FINANCE_PAYMENTS`   | Phiếu thu/chi tài chính                  |
| `/finance/categories`         | `FINANCE_CATEGORIES` | Danh mục thu chi                         |
| `/products`                   | `PRODUCTS`           | Danh sách sản phẩm (giá vốn, tồn kho)   |
| `/customers`                  | `CUSTOMERS`          | Danh sách khách hàng                     |
| `/purchases/receipts`         | `PURCHASE_RECEIPTS`  | Phiếu nhập hàng từ NCC                   |
| `/purchases/returns`          | `PURCHASE_RETURNS`   | Phiếu trả hàng cho NCC                   |
| `/inventory/stocktakes`       | `STOCKTAKES`         | Kiểm kho                                 |
| `/inventory/write-offs`       | `WRITE_OFFS`         | Xuất hủy hàng hóa                        |
| `/suppliers`                  | `SUPPLIERS`          | Danh sách nhà cung cấp                   |

---

## 1. BÁO CÁO CUỐI NGÀY (End of Day Report)

**FE Route**: `/api/reports/end-of-day`
**Backend API sử dụng**: `SALES_INVOICES`, `FINANCE_PAYMENTS`, `FINANCE_CATEGORIES`

### 1.1. Section: BÁN HÀNG (sales)

**Dữ liệu nguồn**: Gọi `GET /sales/invoices` với params:
- `postedAtFrom`: startDate + "T00:00:00"
- `postedAtTo`: endDate + "T23:59:59"
- `customerId`, `serviceMode` (nếu có filter)

**Mapping từng dòng (mỗi invoice = 1 dòng)**:

| Cột hiển thị | Field API Invoice | Công thức |
|---|---|---|
| Mã chứng từ | `invoiceCode` hoặc `id` | Trực tiếp |
| Khách hàng | `customer.name` | Trực tiếp |
| Nhân viên | `createdByUser.fullName` | Trực tiếp |
| Thời gian | `postedAt` hoặc `createdAt` | Format `HH:mm:ss` |
| T.Toán | `payments[0].method` | Lấy phương thức thanh toán đầu tiên |
| SL | `lines[].quantity` | `SUM(line.quantity)` trên tất cả lines |
| Tổng tiền hàng | `subTotalAmount` | Trực tiếp |
| Giảm giá | `discountAmount` | Trực tiếp |
| Doanh thu | `totalAmount` | Trực tiếp |
| Thu khác | - | Luôn = 0 (chưa implement) |
| VAT | - | Luôn = 0 (chưa implement) |
| Làm tròn | - | Luôn = 0 (chưa implement) |
| Phí trả hàng | - | Luôn = 0 (chưa implement) |
| **Thực thu** | `paidAmount` hoặc `totalAmount` | `paidAmount \|\| totalAmount` |
| Ghi nợ | - | `totalAmount - paidAmount` |

**Tổng cuối bảng**:

| Tổng | Công thức |
|---|---|
| Tổng SL | `SUM(tất cả dòng.quantity)` |
| Tổng Doanh thu | `SUM(tất cả dòng.revenue)` |
| Tổng Giảm giá | `SUM(tất cả dòng.discount)` |
| Tổng VAT | `SUM(tất cả dòng.vat)` = 0 |
| **Tổng Thực thu** | `SUM(tất cả dòng.actualRevenue)` |

### 1.2. Section: THU CHI (cashflow)

**Dữ liệu nguồn**: `GET /finance/payments` + `GET /finance/categories`

**Params payments**:
- `paidAtFrom`: startDate + "T00:00:00"
- `paidAtTo`: endDate + "T23:59:59"
- `categoryId` (nếu có filter loại thu chi)

**Mapping từng dòng (mỗi payment = 1 dòng)**:

| Cột hiển thị | Field API Payment | Công thức |
|---|---|---|
| Mã phiếu | `code` hoặc `id` | Trực tiếp |
| Loại thu chi | `categoryId` → lookup `categories` API | Map categoryId → category.name, fallback: documentType mapping |
| Nhân viên | `createdByUser.fullName` | Trực tiếp |
| Người nộp/nhận | `counterparty.name` | Trực tiếp |
| Loại (Thu/Chi) | `type` | `"out"` hoặc `"refund"` → Chi; còn lại → Thu |
| Thời gian | `paidAt` | Format `HH:mm` |
| T.Toán | `method` | Trực tiếp |
| Mã chứng từ | `document.code` | Trực tiếp |
| Số tiền | `amount` | Trực tiếp |

**Mapping documentType → tên hiển thị**:
```
"saleinvoice" → "Thanh toán hóa đơn bán hàng"
"saleinvoice_refund" → "Hoàn tiền hóa đơn bán hàng"
"salereturn" → "Hoàn tiền trả hàng bán"
"saleorder" → "Thanh toán đơn hàng"
"purchaseorder" → "Thanh toán đơn hàng mua"
```

### 1.3. Section: HÀNG HÓA (products)

**Dữ liệu nguồn**: `GET /sales/invoices` (cùng filter date)

**Logic**: Aggregate các `invoice.lines` theo `productId/variantId`

| Cột hiển thị | Field API | Công thức |
|---|---|---|
| Mã hàng | `line.variant.skuCode` hoặc `line.variant.barCode` | Trực tiếp |
| Tên hàng | `line.product.name` hoặc `line.variant.description` | Trực tiếp |
| SL bán | `line.quantity` | `SUM(quantity)` per product |
| Giá trị niêm yết | `line.lineSubtotalAmount` | `SUM(lineSubtotalAmount)` per product |
| Doanh thu | `line.lineTotalAmount` | `SUM(lineTotalAmount)` per product |
| **Chênh lệch** | - | `Giá trị niêm yết - Doanh thu` |
| SL trả | - | Luôn = 0 (chưa tích hợp returns) |
| Giá trị trả | - | Luôn = 0 |
| **Doanh thu thuần** | - | `= Doanh thu` (do chưa trừ hàng trả) |

### 1.4. Section: TỔNG HỢP (summary)

**Dữ liệu nguồn**: Kết hợp `SALES_INVOICES` + `FINANCE_PAYMENTS` + `FINANCE_CATEGORIES`

**Bảng Tổng kết bán hàng**: Aggregate theo phương thức thanh toán

```
salesByPaymentMethod[key].value += invoice.revenue
salesByPaymentMethod[key].amount += invoice.actualRevenue
```

Mapping phương thức thanh toán:
```
"cash", "tiền mặt" → cash
"transfer", "chuyển khoản", "ck" → bankTransfer
"card", "thẻ" → card
"wallet", "ví" → wallet
"point", "điểm" → points
"voucher" → voucher
```

**Bảng Tổng kết thu chi**:
```
Thu (type="in"):
  cash = SUM(amount) where payment.method == "cash"
  bankTransfer = SUM(amount) where payment.method == "transfer"
  total = SUM(amount) of all type="in"

Chi (type="out"):
  (tương tự Thu nhưng cho type="out"/"refund")
```

**Bảng Số lượng giao dịch**:
```
count per payment method = COUNT(invoices) grouped by payment method
```

**Bảng Hàng hóa**:
```
Số mặt hàng = COUNT(DISTINCT productId/variantId) across all invoice lines
SL sản phẩm = SUM(line.quantity) across all invoice lines
```

---

## 2. BÁO CÁO BÁN HÀNG (Sales Report)

**FE Route**: `/api/reports/sales`
**Backend API sử dụng**: `SALES_INVOICES`, `SALES_RETURNS`, `PRODUCTS` (cho profit)

### 2.1. Báo cáo theo Thời gian (areaOfInterest = "time")

**Logic**: Group invoices + returns theo ngày (`postedAt`)

**Mỗi dòng = 1 ngày**:

| Cột hiển thị | Công thức |
|---|---|
| Thời gian | Ngày (YYYY-MM-DD) |
| SL đơn bán | `COUNT(invoices)` trong ngày |
| Tổng tiền hàng | `SUM(invoice.subTotalAmount)` |
| Giảm giá HĐ | `SUM(invoice.discountAmount)` |
| Doanh thu | `SUM(invoice.totalAmount)` |
| SL đơn trả | `COUNT(returns)` trong ngày |
| Giá trị trả | `SUM(return.totalAmount)` |
| **Doanh thu thuần** | `Doanh thu - Giảm giá HĐ - Giá trị trả` |

**Mỗi dòng có thể expand ra chi tiết giao dịch**:
- Invoice: `netRevenue = revenue` (dương)
- Return: `netRevenue = -returnValue` (âm)

### 2.2. Báo cáo Lợi nhuận (areaOfInterest = "profit")

**Dữ liệu thêm**: Fetch `GET /products?pageSize=1000` để lấy `variant.priceCost`

**Tính giá vốn cho mỗi line item** (ưu tiên từ trên xuống):
1. `line.unitCost * quantity`
2. `line.costPrice * quantity`
3. `line.variant.priceCost * quantity`
4. `line.variant.costPrice * quantity`
5. `line.variant.productUnits[default].costPrice * quantity`
6. `variantCostMap[variantId] * quantity` (từ Products API)
7. `line.product.costPrice * quantity`
8. Nếu không tìm thấy → `0`

**Mỗi dòng = 1 ngày**:

| Cột hiển thị | Công thức |
|---|---|
| Tổng tiền hàng | `SUM(invoice.subTotalAmount)` |
| Giảm giá | `SUM(invoice.discountAmount)` |
| Doanh thu | `SUM(invoice.totalAmount) - SUM(return.totalAmount)` |
| Doanh thu thuần | `Doanh thu - Giảm giá` |
| **Tổng giá vốn** | `SUM(line cost) from invoices - SUM(line cost) from returns` |
| **Lợi nhuận gộp** | `Doanh thu thuần - Tổng giá vốn` |

### 2.3. Báo cáo Giảm giá HĐ (areaOfInterest = "invoiceDiscount")

**Logic**: Chỉ hiển thị invoices có `discountAmount > 0`

| Cột hiển thị | Công thức |
|---|---|
| Số HĐ giảm giá | `COUNT(invoices where discountAmount > 0)` per day |
| Tổng giá trị HĐ | `SUM(invoice.totalAmount)` |
| **Giảm giá HĐ** | `SUM(invoice.discountAmount)` |

### 2.4. Báo cáo Trả hàng (areaOfInterest = "returns")

**Dữ liệu nguồn**: Chỉ `SALES_RETURNS`

| Cột hiển thị | Field API | Công thức |
|---|---|---|
| Số phiếu trả | - | `COUNT(returns)` per day |
| Tiền hàng | `lines[].quantity * lines[].price` | `SUM(qty * price)` per return |
| Giảm giá | `return.discountAmount` | Trực tiếp |
| **Giá trị trả** | `return.refundAmount` hoặc `return.totalReturnAmount` | Trực tiếp |

---

## 3. BÁO CÁO ĐẶT HÀNG (Orders Report)

**FE Route**: `/api/reports/orders`
**Backend API sử dụng**: `SALES_ORDERS`, `PRODUCTS` (cho group by category)

### 3.1. Theo Hàng hóa (areaOfInterest = "product")

**Logic**: Group `order.lines` theo productId

| Cột hiển thị | Công thức |
|---|---|
| Mã hàng | `line.productVariant.skuCode` |
| Tên hàng | `line.product.name` |
| SL đặt | `SUM(line.quantity)` per product |
| Giá trị niêm yết | `SUM(line.price * line.quantity)` |
| Giá trị hàng đặt | `SUM(line.total \|\| line.price * qty)` |
| Chênh lệch | `Giá trị niêm yết - Giá trị hàng đặt` |
| SL đã nhận | `isPaid ? quantity : 0` (*)  |
| SL còn lại | `SL đặt - SL đã nhận` |

> (*) **Quan trọng**: FE hiện xác định "đã nhận" dựa vào `order.paidAmount >= order.totalAmount && totalAmount > 0`.
> Đây là logic tạm, cần BE cung cấp field `receivedQuantity` chính xác.

### 3.2. Theo Khách hàng (areaOfInterest = "customer")

**Logic**: Mỗi order = 1 dòng (transaction-based)

| Cột hiển thị | Field API | Công thức |
|---|---|---|
| Mã đơn đặt | `order.code` | Trực tiếp |
| Thời gian | `order.createdAt` | Trực tiếp |
| Khách hàng | `order.customer.name` | Trực tiếp |
| SL | `SUM(line.quantity)` | Trên tất cả lines |
| Tiền hàng | `SUM(line.price * line.quantity)` | |
| Giảm giá | `order.discountAmount` | Trực tiếp |
| Thu khác | `order.otherIncome \|\| order.surcharge` | |
| VAT | `order.vatAmount` | |
| Giá trị đặt | `order.totalAmount` | |
| Đã thanh toán | `order.paidAmount` | |
| **Còn lại** | - | `totalAmount - paidAmount` |

---

## 4. BÁO CÁO HÀNG HÓA (Products Report)

**FE Route**: `/api/reports/products`
**Backend API sử dụng**: Tùy `areaOfInterest`, có thể gọi tới 7 API cùng lúc

### 4.1. Bán hàng / Lợi nhuận (areaOfInterest = "sales" | "profit")

**Backend API**: `SALES_INVOICES`, `SALES_RETURNS`, `PRODUCTS`

**Logic**: Aggregate `invoice.lines` và `return.lines` theo product (variant SKU)

| Cột hiển thị | Công thức |
|---|---|
| Mã hàng | `variant.skuCode` |
| Tên hàng | `variant.name \|\| product.name` |
| SL bán | `SUM(invoice_line.quantity)` per product |
| Giá trị niêm yết | `SUM(invoice_line.quantity * invoice_line.price)` |
| Doanh thu | `SUM(invoice_line.total \|\| qty * price)` |
| **Chênh lệch** | `Giá trị niêm yết - Doanh thu` |
| SL trả | `SUM(return_line.quantity)` per product |
| Giá trị trả | `SUM(return_line.total \|\| qty * price)` |
| **Doanh thu thuần** | `Doanh thu - Chênh lệch - Giá trị trả` |
| Giá vốn (profit) | `SUM(invoice cost) - SUM(return cost)` per product |
| **Lợi nhuận** (profit) | `Doanh thu thuần - Giá vốn` |
| **Tỷ suất LN %** (profit) | `(Lợi nhuận / Doanh thu thuần) * 100` |

**Tính giá vốn**: Giống logic ở mục 2.2 (Sales Profit)

### 4.2. Giá trị Kho (areaOfInterest = "inventoryValue")

**Backend API**: `PRODUCTS` (chỉ 1 API)

**Logic**: Lấy thông tin tồn kho từ product/variant data

| Cột hiển thị | Field API | Công thức |
|---|---|---|
| Mã hàng | `variants[0].skuCode` | Trực tiếp |
| Tên hàng | `product.name` | Trực tiếp |
| Số lượng | `variant.inventory.onHand` | `SUM(all variants)` |
| Giá bán | `variant.priceRetail \|\| variant.priceSale` | Lấy variant đầu tiên |
| **Giá trị bán** | - | `quantity * salePrice` |
| Giá vốn | `variant.priceCost \|\| variant.costPrice` | Lấy variant đầu tiên |
| **Giá trị kho** | - | `quantity * costPrice` |

**Filter thêm**:
- `inventoryStatus = "inStock"`: `quantity > 0`
- `inventoryStatus = "outOfStock"`: `quantity <= 0`
- `inventoryStatus = "belowMinimum"`: `0 < quantity < 10` (hardcoded, cần minQuantity từ BE)
- `productStatus = "active"/"inactive"`: Truyền param `isActive=true/false`

### 4.3. Xuất nhập tồn (areaOfInterest = "stockMovement")

**Backend API**: `PRODUCTS`, `PURCHASE_RECEIPTS`, `SALES_INVOICES`, `WRITE_OFFS`, `STOCKTAKES`, `SALES_RETURNS`, `PURCHASE_RETURNS`

> **⚠️ Đây là report phức tạp nhất, gọi 7 API song song**

**Logic Backtracking** (tính ngược từ tồn kho hiện tại):

```
closingQuantity = currentQuantity - afterPeriodIn + afterPeriodOut
openingQuantity = closingQuantity - inPeriodIn + inPeriodOut
```

Trong đó:
- `currentQuantity`: `variant.inventory.onHand` (tồn kho hiện tại từ Products API)
- `afterPeriodIn`: Tổng SL nhập SAU endDate (các giao dịch sau kỳ báo cáo)
- `afterPeriodOut`: Tổng SL xuất SAU endDate
- `inPeriodIn`: Tổng SL nhập TRONG kỳ
- `inPeriodOut`: Tổng SL xuất TRONG kỳ

**Nguồn NHẬP (quantityIn)**:
| Nguồn | API | Field quantity | Điều kiện date |
|---|---|---|---|
| Nhập từ NCC | `PURCHASE_RECEIPTS` | `line.quantity` | `status in ['completed', 'hoàn thành']` |
| Kiểm kho tăng | `STOCKTAKES` | `line.differenceQuantity > 0` | `status = 'completed'` |
| Trả hàng bán (nhập lại) | `SALES_RETURNS` | `line.quantity` | Date trong kỳ |

**Nguồn XUẤT (quantityOut)**:
| Nguồn | API | Field quantity | Điều kiện date |
|---|---|---|---|
| Bán hàng | `SALES_INVOICES` | `line.quantity` | Date trong kỳ |
| Xuất hủy | `WRITE_OFFS` | `line.quantity` | Date trong kỳ |
| Kiểm kho giảm | `STOCKTAKES` | `abs(line.differenceQuantity)` where < 0 | `status = 'completed'` |
| Trả NCC | `PURCHASE_RETURNS` | `line.quantity` | Date trong kỳ |

**Tính giá trị**:
```
openingValue = openingQuantity * costPrice (from product)
closingValue = closingQuantity * costPrice
valueIn = SUM(line.quantity * line.unitPrice) per product [từ purchase receipts]
valueOut = SUM(line.quantity * line.unitPrice) per product [từ sales + write-offs]
```

**Xử lý sản phẩm tạo trong kỳ**: Nếu `product.createdAt` nằm trong [startDate, endDate]:
- `openingQuantity = 0`
- Số lượng chênh lệch (`closingQuantity + totalOut - totalIn`) được cộng vào `quantityIn`

**Bảng kết quả**:

| Cột | Công thức |
|---|---|
| Tồn đầu kỳ (SL) | `closingQuantity - quantityIn + quantityOut` |
| Tồn đầu kỳ (Giá trị) | `openingQuantity * costPrice` |
| SL Nhập | `SUM(tất cả nguồn nhập)` |
| Giá trị Nhập | `SUM(quantity * unitPrice)` từ receipts |
| SL Xuất | `SUM(tất cả nguồn xuất)` |
| Giá trị Xuất | `SUM(quantity * unitPrice)` từ invoices + write-offs |
| Tồn cuối kỳ (SL) | `currentQuantity - afterIn + afterOut` |
| Tồn cuối kỳ (Giá trị) | `closingQuantity * costPrice` |

### 4.4. Xuất nhập tồn chi tiết (areaOfInterest = "stockMovementDetail")

**Giống 4.3** nhưng phân tách chi tiết nguồn nhập/xuất:

**Cột NHẬP chi tiết**:
| Cột | Nguồn |
|---|---|
| Nhập từ NCC | `PURCHASE_RECEIPTS.lines` |
| Kiểm kho tăng | `STOCKTAKES.lines (differenceQty > 0)` |
| Trả hàng bán | `SALES_RETURNS.lines` |
| Chuyển kho vào | Chưa implement (= 0) |
| Sản xuất vào | Chưa implement (= 0) |

**Cột XUẤT chi tiết**:
| Cột | Nguồn |
|---|---|
| Bán hàng | `SALES_INVOICES.lines` |
| Xuất hủy | `WRITE_OFFS.lines` |
| Trả NCC | `PURCHASE_RETURNS.lines` |
| Kiểm kho giảm | `STOCKTAKES.lines (differenceQty < 0)` |
| Chuyển kho ra | Chưa implement (= 0) |
| Sản xuất ra | Chưa implement (= 0) |

### 4.5. Xuất hủy (areaOfInterest = "writeOff")

**Backend API**: `WRITE_OFFS`

**Logic**: Aggregate `writeOff.lines` theo product code

| Cột | Công thức |
|---|---|
| Mã hàng | `line.variant.skuCode` |
| Tên hàng | `line.product.name` |
| **SL hủy** | `SUM(line.quantity)` per product |
| **Giá trị hủy** | `SUM(line.lineTotalAmount \|\| quantity * line.price)` |

**Điều kiện**: Chỉ lấy write-offs có `status = 'completed'`

### 4.6. NCC theo hàng nhập (areaOfInterest = "supplierImport")

**Backend API**: `PRODUCTS`, `PURCHASE_RECEIPTS`, `PURCHASE_RETURNS`

| Cột | Công thức |
|---|---|
| Mã hàng | `line.variant.skuCode` |
| SL NCC | `COUNT(DISTINCT supplierId)` per product |
| SL nhập | `SUM(purchase_line.quantity)` per product |
| Giá trị nhập | `SUM(line.lineTotalAmount \|\| qty * price)` |
| SL trả NCC | `SUM(return_line.quantity)` per product |
| Giá trị trả NCC | `SUM(return_line.totalAmount \|\| qty * price)` |
| **Giá trị thuần** | `Giá trị nhập - Giá trị trả NCC` |

---

## 5. BÁO CÁO KHÁCH HÀNG (Customers Report)

**FE Route**: `/api/reports/customers`
**Backend API**: `CUSTOMERS`, `SALES_INVOICES`, `SALES_RETURNS`, `FINANCE_PAYMENTS` (debt only), `PRODUCTS` (product filter)

### 5.1. Bán hàng (areaOfInterest = "sales")

**Logic**: Group invoices + returns theo customerId

| Cột hiển thị | Công thức |
|---|---|
| Mã KH | `customer.code` |
| Tên KH | `customer.name` |
| SL đơn bán | `COUNT(invoices)` per customer |
| Tổng tiền hàng | `SUM(invoice.subTotalAmount)` |
| Giảm giá | `SUM(invoice.discountAmount)` |
| Doanh thu | `SUM(invoice.totalAmount)` |
| SL đơn trả | `COUNT(returns)` per customer |
| Giá trị trả | `SUM(return.totalAmount)` hoặc `SUM(return_line.price * qty)` |
| **Doanh thu thuần** | `Doanh thu - Giá trị trả` |

**Khách lẻ**: Nếu invoice không có `customerId` → nhóm vào "Khách lẻ" (id = "retail-customer")

### 5.2. Lợi nhuận (areaOfInterest = "profit")

Giống 5.1 nhưng thêm:

| Cột | Công thức |
|---|---|
| Giá vốn | `SUM(invoice.totalCost \|\| invoice.costAmount) - SUM(return.totalCost)` |
| **Lợi nhuận gộp** | `Doanh thu thuần - Giá vốn` |

### 5.3. Công nợ (areaOfInterest = "debt")

**Logic**: Tính số dư nợ theo kỳ

**QUAN TRỌNG**: Khi tính công nợ, FE KHÔNG lọc theo `fromDate` ở API invoices — fetch TẤT CẢ invoices đến `toDate`, sau đó tính:

```
Với mỗi invoice:
  if (invoiceDate < fromDate):
    openingBalance += invoice.totalAmount  // Nợ phát sinh trước kỳ
  else:
    debitAmount += invoice.totalAmount     // Nợ phát sinh trong kỳ

Với mỗi return:
  if (returnDate < fromDate):
    openingBalance -= return.totalAmount   // Giảm nợ trước kỳ
  else:
    creditAmount += return.totalAmount     // Giảm nợ trong kỳ

Với mỗi payment (type='receipt'):
  if (paymentDate < fromDate):
    openingBalance -= payment.amount       // Thanh toán trước kỳ
  else:
    creditAmount += payment.amount         // Thanh toán trong kỳ
```

| Cột | Công thức |
|---|---|
| Nợ đầu kỳ | Tích lũy từ tất cả giao dịch trước `fromDate` |
| Phát sinh tăng (Ghi nợ) | `SUM(invoice.totalAmount)` trong kỳ |
| Phát sinh giảm (Ghi có) | `SUM(return.totalAmount + payment.amount)` trong kỳ |
| **Nợ cuối kỳ** | `Nợ đầu kỳ + Phát sinh tăng - Phát sinh giảm` |

### 5.4. Hàng hóa đã mua (areaOfInterest = "products")

| Cột | Công thức |
|---|---|
| SL mua | `SUM(invoice_line.quantity)` per customer |
| SL trả | `SUM(return_line.qtyReturned \|\| return_line.quantity)` per customer |
| Doanh thu | `SUM(invoice_line.totalPrice)` |
| Giá trị trả | `SUM(return_line.price * qty)` |
| **Doanh thu thuần** | `Doanh thu - Giá trị trả` |

**Filter nhóm hàng**: Khi có `productGroup`, fetch `PRODUCTS` API để xây productCategoryMap, filter invoice/return lines theo category

---

## 6. BÁO CÁO TÀI CHÍNH (Financial Report)

**FE Route**: `/api/reports/financial`
**Backend API**: `SALES_INVOICES`, `SALES_RETURNS`, `FINANCE_PAYMENTS`, `WRITE_OFFS`, `PRODUCTS`, `PURCHASE_RECEIPTS`

> **⚠️ Đây là report quan trọng nhất về mặt tài chính, tính toán Báo cáo Kết quả Kinh doanh**

### Cấu trúc báo cáo:

```
(1) Doanh thu bán hàng
(2) Giảm trừ doanh thu = (2.1) + (2.2)
    (2.1) Chiết khấu hóa đơn
    (2.2) Giá trị hàng bán bị trả lại
(3) Doanh thu thuần = (1) - (2)
(4) Giá vốn hàng bán
(5) Lợi nhuận gộp = (3) - (4)
(6) Chi phí
    (6.1) Chi phí voucher
    (6.2) Phí trả ĐTGH
    (6.3) Hoàn tiền cho khách
    (6.4) Xuất hủy hàng hóa
    (6.5) Giá trị thanh toán bằng điểm
    (6.6) Chiết khấu thanh toán cho khách
    (6.8) Chênh lệch làm tròn nhập hàng
    (6.9) Chênh lệch làm tròn bán hàng
(7) Lợi nhuận kinh doanh = (5) - (6)
(8) Thu nhập khác
    (8.1) Phí trả hàng
    (8.2) Chênh lệch làm tròn nhập hàng
    (8.3) Chênh lệch làm tròn bán hàng
    (8.4) Chiết khấu thanh toán từ NCC
(9) Chi phí khác
(10) Lợi nhuận thuần = (7) + (8) - (9)
```

### Chi tiết công thức:

**(1) Doanh thu bán hàng** = `SUM(invoice.subTotal || invoice.subTotalAmount || (invoice.totalAmount + invoice.discount))`
> Sử dụng subTotal (trước giảm giá). Bỏ qua invoices có `status = 'cancelled'`

**(2.1) Chiết khấu hóa đơn** = `SUM(invoice.discount || invoice.discountAmount || invoice.totalDiscount)`

**(2.2) Giá trị hàng bán bị trả lại**:
```
Với mỗi return (bỏ qua status='cancelled'):
  Nếu có lines:
    totalReturnValue += SUM(line.price * line.quantity)
    // priority: line.price → line.unitPrice → line.originalPrice → line.returnPrice → lineTotalAmount/qty
  Nếu không có lines:
    totalReturnValue += return.subTotalAmount || return.totalAmount
```

**(3) Doanh thu thuần** = `(1) - (2.1) - (2.2)`

**(4) Giá vốn hàng bán** (COGS):
```
Giá vốn bán = SUM(invoice_line.costPrice * line.quantity)
  // priority: line.costPrice → line.capitalPrice → line.priceCost → variantCostMap[variantId] → 0
  // Nếu không tìm thấy cost trên line, fallback: invoice.totalCost

Giá vốn trả = SUM(return_line.costPrice * return_line.quantity)

COGS thuần = Giá vốn bán - Giá vốn trả
```

**(5) Lợi nhuận gộp** = `(3) - (4)`

**(6) Chi phí** - phân loại từ `FINANCE_PAYMENTS` + `SALES_RETURNS` + `WRITE_OFFS`:

| Mục | Nguồn | Logic xác định |
|---|---|---|
| 6.1 Chi phí voucher | Payments (type=Payment) | `categoryName.includes("voucher")` |
| 6.2 Phí trả ĐTGH | Payments (type=Payment) | `categoryName.includes("giao hàng") \|\| "đtgh" \|\| "vận chuyển"` |
| 6.3 Hoàn tiền cho khách | Sales Returns | `SUM(return.refundAmount \|\| return.totalAmount)` |
| 6.4 Xuất hủy hàng hóa | Write-offs | `SUM(writeOff.totalValue \|\| SUM(line.costPrice * qty))` |
| 6.5 Điểm thanh toán | Payments (type=Payment) | `categoryName.includes("điểm") \|\| "point"` |
| 6.6 Chiết khấu TT cho KH | - | Luôn = 0 (chưa implement) |
| 6.8 Làm tròn nhập | Payments (type=Payment) | `includes("làm tròn") && includes("nhập")` |
| 6.9 Làm tròn bán | Payments (type=Payment) | `includes("làm tròn") && includes("bán")` |

> **Loại trừ**: Payments liên quan đến Order/PurchaseOrder (trả NCC), payments có category chứa "lương"

**(7) Lợi nhuận kinh doanh** = `(5) - (6)`

**(8) Thu nhập khác** - từ `FINANCE_PAYMENTS (type=Receipt)` + `SALES_RETURNS`:

| Mục | Nguồn | Logic |
|---|---|---|
| 8.1 Phí trả hàng | Sales Returns | `SUM(return.refundFee \|\| return.returnFee)` |
| 8.2 Làm tròn nhập | Payments (type=Receipt) | `includes("làm tròn") && includes("nhập")` |
| 8.3 Làm tròn bán | Payments (type=Receipt) | `includes("làm tròn") && includes("bán")` |
| 8.4 Chiết khấu TT từ NCC | Payments (type=Receipt) | `includes("chiết khấu") && includes("ncc"/"nhà cung cấp")` |

**(9) Chi phí khác** = Payments type=Payment có `categoryName.includes("chi phí khác")`

**(10) Lợi nhuận thuần** = `(7) + (8) - (9)`

---

## 7. BÁO CÁO NHÀ CUNG CẤP (Suppliers Report)

**FE Route**: `/api/reports/suppliers`
**Backend API**: `PURCHASE_RECEIPTS`, `PURCHASE_RETURNS`, `PRODUCTS`, `FINANCE_PAYMENTS` (debt only)

### 7.1. Nhập hàng (areaOfInterest = "import")

**Logic**: Group purchase receipts + returns theo supplierId

| Cột hiển thị | Công thức |
|---|---|
| Mã NCC | `supplier.code` |
| Tên NCC | `supplier.name` |
| Giá trị nhập | `SUM(purchaseReceipt.totalAmount)` per supplier |
| Giá trị trả | `SUM(purchaseReturn.totalAmount)` per supplier |
| **Giá trị thuần** | `Giá trị nhập - Giá trị trả` |

**Horizontal mode thêm**:

| Cột | Công thức |
|---|---|
| Số phiếu nhập | `COUNT(purchaseReceipts)` |
| Tiền hàng | `SUM(receipt.subTotalAmount)` |
| Giảm giá | `SUM(receipt.discountAmount)` |
| Số phiếu trả | `COUNT(purchaseReturns)` per supplier |
| Làm tròn | Tính `calculateRoundedValue(subTotal)` — See logic below |

```javascript
// Rounding logic
calculateRoundedValue(amount) {
  const hundreds = amount % 1000;
  if (hundreds === 0) return amount;
  if (hundreds >= 500) return amount + (1000 - hundreds);
  else return amount - hundreds;
}
```

### 7.2. Công nợ NCC (areaOfInterest = "debt")

**Logic tương tự Công nợ khách hàng (5.3)** nhưng ngược lại:

```
Purchases → Tăng nợ (debitAmount)
Returns → Giảm nợ (creditAmount)
Payments (type=supplier) → Giảm nợ (creditAmount)
```

| Cột | Công thức |
|---|---|
| Nợ đầu kỳ | Accumulated từ giao dịch trước `fromDate` |
| Phát sinh tăng | `SUM(purchase.totalAmount)` trong kỳ |
| Phát sinh giảm | `SUM(return.totalAmount) + SUM(payment.amount)` trong kỳ |
| **Nợ cuối kỳ** | `openingBalance + debitAmount - creditAmount` |

### 7.3. Nhập theo NCC (areaOfInterest = "importBySupplier")

**Logic**: Group products theo supplier, chi tiết từng sản phẩm

| Cột sản phẩm | Công thức |
|---|---|
| Mã hàng | `line.productVariant.skuCode` |
| Tên hàng | `line.product.name` |
| SL nhập | `SUM(purchase_line.quantity)` |
| Giá trị nhập | `SUM(line.total \|\| qty * unitPrice)` |
| SL trả | `SUM(return_line.quantity)` |
| Giá trị trả | `SUM(return_line.total \|\| qty * returnPrice)` |
| **SL còn lại** | `SL nhập - SL trả` |
| **Giá trị thuần** | `Giá trị nhập - Giá trị trả` |

---

## 8. TỔNG KẾT CÁC VẤN ĐỀ CẦN BE GIẢI QUYẾT

### 8.1. Các giá trị FE đang hardcode = 0

| Report | Field | Lý do |
|---|---|---|
| End of Day - Sales | VAT, Làm tròn, Phí trả hàng, Thu khác | Chưa có field tương ứng từ API |
| End of Day - Products | SL trả, Giá trị trả | Chưa tích hợp Sales Returns |
| Financial Report | Chiết khấu thanh toán cho khách (6.6) | Chức năng chưa implement |
| Stock Movement | Chuyển kho, Sản xuất | API chưa có |

### 8.2. Logic FE đang tính sai hoặc workaround

| Report | Vấn đề | Mô tả |
|---|---|---|
| Orders Report | `receivedQuantity` | FE tạm xác định "đã nhận" bằng `paidAmount >= totalAmount`. Cần field chính xác từ BE |
| Inventory Value | `belowMinimum` | Hardcode `< 10`. Cần `product.minQuantity` từ BE |
| Stock Movement | Backtracking logic | FE tính ngược từ tồn kho hiện tại, rất dễ sai. BE nên tính trực tiếp |
| Financial Report | Category matching | FE matching bằng string.includes() trên categoryName → dễ sai khi tên thay đổi |
| Customers Debt | Date filtering | FE fetch TẤT CẢ invoices/returns (ko filter date ở API) rồi lọc client-side → chậm |

### 8.3. API mà BE nên tạo cho Report

Đề xuất BE tạo các endpoint mới trả về dữ liệu đã tính toán sẵn:

```
GET /reports/end-of-day?section=sales&date=2026-01-15&branch=xxx
GET /reports/end-of-day?section=cashflow&fromDate=...&toDate=...
GET /reports/end-of-day?section=products&date=...
GET /reports/end-of-day?section=summary&date=...

GET /reports/sales?areaOfInterest=time&fromDate=...&toDate=...
GET /reports/sales?areaOfInterest=profit&fromDate=...&toDate=...
GET /reports/sales?areaOfInterest=invoiceDiscount&fromDate=...&toDate=...
GET /reports/sales?areaOfInterest=returns&fromDate=...&toDate=...

GET /reports/orders?areaOfInterest=product&orderTimeMode=thisWeek
GET /reports/orders?areaOfInterest=customer&orderTimeMode=thisWeek

GET /reports/products?areaOfInterest=sales&timeMode=thisWeek
GET /reports/products?areaOfInterest=profit&timeMode=thisWeek
GET /reports/products?areaOfInterest=inventoryValue&inventoryStatus=all
GET /reports/products?areaOfInterest=stockMovement&timeMode=thisWeek
GET /reports/products?areaOfInterest=stockMovementDetail&timeMode=thisWeek
GET /reports/products?areaOfInterest=writeOff&timeMode=thisWeek
GET /reports/products?areaOfInterest=supplierImport&timeMode=thisWeek

GET /reports/customers?areaOfInterest=sales&timeMode=thisWeek
GET /reports/customers?areaOfInterest=profit&timeMode=thisWeek
GET /reports/customers?areaOfInterest=debt&fromDate=...&toDate=...
GET /reports/customers?areaOfInterest=products&timeMode=thisWeek

GET /reports/financial?fromDate=...&toDate=...

GET /reports/suppliers?areaOfInterest=import&fromDate=...&toDate=...
GET /reports/suppliers?areaOfInterest=debt&fromDate=...&toDate=...
GET /reports/suppliers?areaOfInterest=importBySupplier&fromDate=...&toDate=...
```

### 8.4. Danh sách tất cả Filter params mà FE đang truyền

| Report | Params |
|---|---|
| End of Day | `section`, `timeMode`, `date`, `fromDate`, `toDate`, `fromTime`, `toTime`, `customer`, `paymentMethod`, `salesMethod`, `cashflowType`, `products`, `productType`, `productGroup` |
| Sales | `reportType`, `displayMode`, `areaOfInterest`, `priceList`, `timeMode`, `fromDate`, `toDate`, `salesMethod`, `salesChannel` |
| Orders | `reportType`, `displayMode`, `groupBySameProduct`, `groupByProductGroup`, `areaOfInterest`, `orderTimeMode`, `orderFromDate`, `orderToDate`, `deliveryTimeMode`, `deliveryFromDate`, `deliveryToDate`, `status`, `customerId` |
| Products | `reportType`, `displayMode`, `groupBySameProduct`, `groupByProductGroup`, `areaOfInterest`, `timeMode`, `fromDate`, `toDate`, `productSearch`, `productGroup`, `inventoryStatus`, `productStatus`, `supplierId` |
| Customers | `areaOfInterest`, `timeMode`, `fromDate`, `toDate`, `customerSearch`, `debtFrom`, `debtTo`, `productGroup`, `groupByProductGroup` |
| Financial | `timeMode`, `year`, `month`, `fromDate`, `toDate` |
| Suppliers | `areaOfInterest`, `timeMode`, `fromDate`, `toDate`, `supplierId`, `debtFrom`, `debtTo` |

---

## 9. REFERENCE: Cách FE tính Date Range từ timeMode

FE tính date range client-side từ `timeMode`:

```javascript
switch (timeMode) {
  case "today": from = to = today
  case "yesterday": from = to = today - 1
  case "thisWeek": from = Monday of current week, to = Sunday
  case "lastWeek": from = Monday of last week, to = Sunday of last week
  case "last7Days": from = today - 6, to = today
  case "thisMonth": from = 1st of month, to = last day of month
  case "lastMonth": from = 1st of last month, to = last day of last month
  case "last30Days": from = today - 29, to = today
  case "thisQuarter": from = 1st of quarter, to = last day of quarter
  case "lastQuarter": from = 1st of last quarter, to = last day
  case "thisYear": from = Jan 1, to = Dec 31
  case "lastYear": from = Jan 1 last year, to = Dec 31 last year
  case "custom": from = fromDate, to = toDate (user picks)
}
```

> **Gợi ý**: BE nên hỗ trợ nhận `timeMode` trực tiếp thay vì FE phải tính rồi truyền `fromDate/toDate`, để đảm bảo consistency.

---

*Tài liệu này được tạo bằng cách phân tích source code FE tại `app/api/reports/` và `components/reports/`. Mọi logic tính toán hiện đang nằm ở FE Next.js API Routes.*
