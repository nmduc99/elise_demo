# Payment API - Missing Fields / Questions for Backend

## Đã tích hợp POST /api/finance/payments

### Request Body Mapping
Tất cả các field trong BE example đã được map:
- ✅ `type`: "in" | "out" (đã cập nhật từ "receipt" | "refund")
- ✅ `method`: "cash" | "transfer"
- ✅ `accountId`: string | null (optional)
- ✅ `amount`: number
- ✅ `paidAt`: ISO string
- ✅ `code`: string | null (optional, BE sẽ generate)
- ✅ `note`: string | null (optional)
- ✅ `isAccounted`: boolean
- ✅ `categoryId`: string | null (optional)
- ✅ `counterpartyType`: "customer"
- ✅ `counterpartyId`: string | null (optional)
- ✅ `shiftId`: string | null (optional)
- ✅ `transferId`: string | null (optional)

## Vấn đề phát hiện:

### ✅ `categoryId` - ĐÃ TÍCH HỢP
- **Error từ BE**: "Manual payment requires CategoryId when DocumentId is null."
- **Đã tích hợp**: GET `/api/finance/categories` để lấy categories từ BE
- **Format**: Form giờ sử dụng UUID từ BE (từ `FinanceCategory.id`)
- **Status**: ✅ Đã map đúng - `categoryId` giờ là UUID từ BE

## Các field đang set null và cần xác nhận từ BE:

### 1. `accountId` (cho bank transfers)
- **Hiện tại**: Set `null` cho tất cả payments
- **Cần**: Cách lấy `accountId` từ `bankAccountName`/`bankAccountNumber` trong form
- **Câu hỏi cho BE**:
  - Có API nào để search account từ `bankAccountName`/`bankAccountNumber` không?
  - Hay cần truyền `accountId` trực tiếp từ form?
  - Nếu không có `accountId`, BE có tự động tạo account mới không?

### 2. `counterpartyId` (cho customer)
- **Hiện tại**: Set `null` cho tất cả payments
- **Cần**: Cách lấy `counterpartyId` từ `payerOrPayee` (tên khách hàng) hoặc `payerCode` (mã khách hàng)
- **Câu hỏi cho BE**:
  - Có API nào để search customer từ `payerOrPayee`/`payerCode` không?
  - Hay cần truyền `counterpartyId` trực tiếp từ form?
  - Nếu không có `counterpartyId`, BE có tự động tạo customer mới không?
  - Hay có thể để `null` và BE sẽ xử lý?

### 3. `shiftId` (cho cash payments)
- **Hiện tại**: Set `null` cho tất cả payments
- **Cần**: Cách lấy `shiftId` từ current shift hoặc `staffId`
- **Câu hỏi cho BE**:
  - Có API nào để lấy current shift không?
  - Hay cần truyền `shiftId` trực tiếp từ form?
  - Nếu không có `shiftId`, BE có tự động lấy current shift không?
  - Hay có thể để `null` và BE sẽ xử lý?

### 4. `transferId` (cho bank transfers)
- **Hiện tại**: Set `null` cho tất cả payments
- **Cần**: Cách lấy `transferId` cho bank transfers
- **Câu hỏi cho BE**:
  - `transferId` là gì? Có phải là transaction reference từ ngân hàng không?
  - Có cần truyền `transferId` từ form không?
  - Hay có thể để `null` và BE sẽ xử lý?

## Tóm tắt
- ✅ Tất cả field đã được map đúng format
- ⚠️ Các field `accountId`, `counterpartyId`, `shiftId`, `transferId` đang set `null`
- ❓ Cần xác nhận từ BE: Các field này có bắt buộc không? Có cách nào để lấy giá trị không?

