# Payment API - Questions for Backend Team

## Fields cần làm rõ từ Backend API response:

### 1. **Counterparty Information** (Thông tin đối tác)
- **Question**: Làm thế nào để lấy tên, số điện thoại, địa chỉ của `counterparty` từ `counterpartyId` và `counterpartyType`?
  - Hiện tại: `counterpartyType` = "Customer" | "customer", `counterpartyId` = UUID
  - Cần: API endpoint để fetch customer info từ `counterpartyId`?
  - Hoặc: Backend có thể include customer name trong Payment response không?

### 2. **Account Information** (Thông tin tài khoản ngân hàng)
- **Question**: Làm thế nào để lấy tên tài khoản và số tài khoản từ `accountId`?
  - Hiện tại: `accountId` = UUID (nullable)
  - Cần: API endpoint để fetch account info từ `accountId`?
  - Hoặc: Backend có thể include account name/number trong Payment response không?

### 3. **Branch/Shop Information** (Thông tin chi nhánh)
- **Question**: Làm thế nào để lấy tên chi nhánh từ `shopId`?
  - Hiện tại: `shopId` = UUID
  - Cần: API endpoint để fetch shop/branch name từ `shopId`?
  - Hoặc: Backend có thể include shop/branch name trong Payment response không?

### 4. **Staff Information** (Thông tin nhân viên)
- **Question**: Làm thế nào để lấy tên nhân viên từ `shiftId`?
  - Hiện tại: `shiftId` = UUID (nullable)
  - Cần: API endpoint để fetch staff name từ `shiftId`?
  - Hoặc: Có field `staffId` riêng không? Hoặc Backend có thể include staff name trong Payment response không?

### 5. **Category Information** (Thông tin danh mục)
- **Question**: `categoryId` có được sử dụng không? Nếu có, làm thế nào để lấy tên category?
  - Hiện tại: `categoryId` = UUID (nullable)
  - Cần: API endpoint để fetch category name từ `categoryId`?
  - Hoặc: Backend có thể include category name trong Payment response không?

### 6. **Transaction Content** (Nội dung giao dịch)
- **Question**: Có field nào trong Payment response chứa "Nội dung chuyển khoản" (transaction content) không?
  - Hiện tại: Không thấy field này trong response
  - Cần: Field này có tồn tại không? Tên field là gì?

### 7. **Payer Code** (Mã đối tác)
- **Question**: Có field nào chứa mã code của counterparty (ví dụ: mã khách hàng) không?
  - Hiện tại: Không thấy field này trong response
  - Cần: Field này có tồn tại không? Tên field là gì?

## Mapping hiện tại:

### GET Payments (Đã hoàn thành):
- ✅ `type`: "Receive"/"receipt" → "in", "Refund" → "out"
- ✅ `method`: "Cash" → "cash", "transfer" → "bank"
- ✅ `status`: Mặc định "Paid" → hiển thị "paid", "Cancelled"/"Voided" → hiển thị "cancelled"
- ✅ `code`: Sử dụng `code` hoặc `manualCode`
- ✅ `amount`: Số tiền
- ✅ `paidAt`: Thời gian thanh toán
- ✅ `note`: Ghi chú
- ⚠️ `category`: Đang dùng `documentType` tạm thời (cần xác nhận)
- ❌ `payerOrPayee`: Cần fetch từ counterparty
- ❌ `payerCode`: Cần fetch từ counterparty
- ❌ `payerPhone`: Cần fetch từ counterparty
- ❌ `payerAddress`: Cần fetch từ counterparty
- ❌ `bankAccountName`: Cần fetch từ accountId
- ❌ `bankAccountNumber`: Cần fetch từ accountId
- ❌ `branchName`: Cần fetch từ shopId
- ❌ `staffName`: Cần fetch từ shiftId hoặc staffId

### POST Create Payment (Đã hoàn thành):
- ✅ `type`: "in" → "receipt", "out" → "refund"
- ✅ `method`: "cash" | "transfer" | "card" | "wallet" → "cash" | "transfer"
- ✅ `amount`: Số tiền
- ✅ `paidAt`: ISO string format
- ✅ `note`: Ghi chú (bao gồm thông tin payerOrPayee, payerCode, etc.)
- ✅ `isAccounted`: "paid" → true
- ✅ `categoryId`: Category ID từ form
- ⚠️ `counterpartyType`: Mặc định "customer"
- ❌ `counterpartyId`: Cần fetch từ payerOrPayee hoặc payerCode (hiện tại null)
- ❌ `accountId`: Cần fetch từ bankAccountName/bankAccountNumber (hiện tại null)
- ❌ `shiftId`: Cần lấy từ current shift hoặc staffId (hiện tại null)
- ❌ `transferId`: Cần cho bank transfers (hiện tại null)

