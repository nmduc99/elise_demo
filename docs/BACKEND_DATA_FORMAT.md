# Backend Data Format Documentation

Tài liệu này mô tả format data mà backend API trả về và cách handle trong frontend.

## Invoice Data Format

### Backend Response Format

Backend trả về các enum values ở dạng **PascalCase**, không phải lowercase:

```typescript
{
  "serviceMode": "Takeaway",  // NOT "takeaway"
  "status": "Posted",          // NOT "posted"
  "paymentStatus": "Paid",     // NOT "paid"
  "stockStatus": "NotPosted"   // NOT "not_posted"
}
```

### Frontend Mapping

Để hiển thị đúng translation, frontend cần map cả PascalCase và lowercase:

#### Service Mode

**Backend values:**
- `Delivery`
- `Takeaway`
- `DineIn`

**Translation keys:**
```json
{
  "invoice": {
    "filter": {
      "delivery": "Giao hàng",
      "takeaway": "Mang đi",
      "dineIn": "Tại chỗ"
    }
  }
}
```

**Frontend mapping:**
```typescript
const serviceModeMap: Record<string, string> = {
    'Delivery': t("filter.delivery"),
    'Takeaway': t("filter.takeaway"),
    'DineIn': t("filter.dineIn"),
    // Fallback cho lowercase nếu có
    'delivery': t("filter.delivery"),
    'takeaway': t("filter.takeaway"),
    'dine_in': t("filter.dineIn")
};
```

#### Status

**Backend values:**
- `Draft`
- `Confirmed`
- `Posted`
- `Cancelled`

**Translation keys:**
```json
{
  "invoice": {
    "statusDraft": "Nháp",
    "statusConfirmed": "Đã xác nhận",
    "statusPosted": "Đã đăng",
    "statusCancelled": "Đã hủy"
  }
}
```

**Frontend mapping:**
```typescript
const statusMap: Record<string, string> = {
    'Draft': t("statusDraft"),
    'Confirmed': t("statusConfirmed"),
    'Posted': t("statusPosted"),
    'Cancelled': t("statusCancelled"),
    // Fallback cho lowercase
    'draft': t("statusDraft"),
    'confirmed': t("statusConfirmed"),
    'posted': t("statusPosted"),
    'cancelled': t("statusCancelled")
};
```

#### Payment Status

**Backend values:**
- `Unpaid`
- `Partial`
- `Paid`

**Translation keys:**
```json
{
  "invoice": {
    "paymentStatusUnpaid": "Chưa thanh toán",
    "paymentStatusPartial": "Thanh toán một phần",
    "paymentStatusPaid": "Đã thanh toán"
  }
}
```

**Frontend mapping:**
```typescript
const paymentStatusMap: Record<string, string> = {
    'Unpaid': t("paymentStatusUnpaid"),
    'Partial': t("paymentStatusPartial"),
    'Paid': t("paymentStatusPaid"),
    // Fallback cho lowercase
    'unpaid': t("paymentStatusUnpaid"),
    'partial': t("paymentStatusPartial"),
    'paid': t("paymentStatusPaid")
};
```

#### Stock Status

**Backend values:**
- `Posted`
- `NotPosted`

**Translation keys:**
```json
{
  "invoice": {
    "stockStatusPosted": "Đã ghi sổ",
    "stockStatusNotPosted": "Chưa ghi sổ"
  }
}
```

**Frontend mapping:**
```typescript
const stockStatusMap: Record<string, string> = {
    'Posted': t("stockStatusPosted"),
    'NotPosted': t("stockStatusNotPosted"),
    // Fallback cho lowercase
    'posted': t("stockStatusPosted"),
    'not_posted': t("stockStatusNotPosted")
};
```

## Files Updated

### 1. `components/invoice/InvoiceTable.tsx`
- Updated `serviceModeMap`, `statusMap`, `paymentStatusMap`
- Added support for both PascalCase (from backend) and lowercase (fallback)
- Updated className conditions to check both formats

### 2. `components/invoice/ExpandedInvoiceTabs.tsx`
- Updated all translation maps
- Updated badge rendering conditions
- Ensures consistent translation display

## Best Practices

### 1. Always Include Both Formats
Luôn map cả PascalCase và lowercase để đảm bảo tương thích:

```typescript
const map: Record<string, string> = {
    'PascalCase': t("key"),
    'lowercase': t("key")
};
```

### 2. Check Both in Conditions
Khi so sánh values, check cả 2 formats:

```typescript
className={`... ${
    value === 'PascalCase' || value === 'lowercase'
        ? 'class-1'
        : 'class-2'
}`}
```

### 3. Remove Fallback Strings
Không nên dùng fallback strings như `|| "English Text"`:

```typescript
// ❌ BAD
'Delivery': t("filter.delivery") || "Delivery"

// ✅ GOOD
'Delivery': t("filter.delivery")
```

## Testing

Khi test translation:

1. **Kiểm tra backend response:**
   - Open Browser DevTools > Network
   - Xem response từ `/api/invoices`
   - Verify format của `serviceMode`, `status`, `paymentStatus`

2. **Kiểm tra translation keys:**
   - Verify keys exist trong `languages/vi.json` và `languages/en.json`
   - Đảm bảo structure đúng (nested objects)

3. **Test display:**
   - Load trang Invoice
   - Verify tất cả badges hiển thị tiếng Việt
   - Click expand row, verify expanded view cũng đúng

## Common Issues

### Issue: Hiển thị tiếng Anh thay vì tiếng Việt

**Nguyên nhân:**
- Backend trả về PascalCase nhưng frontend chỉ map lowercase
- Translation key không tồn tại hoặc structure sai

**Giải pháp:**
1. Check backend response format
2. Update mapping để include PascalCase
3. Verify translation keys trong language files

### Issue: Badges hiển thị raw value (VD: "Takeaway" thay vì "Mang đi")

**Nguyên nhân:**
- Map không chứa value từ backend
- Translation function không hoạt động

**Giải pháp:**
1. Add value vào map
2. Verify `useTranslations("invoice")` được call đúng
3. Check translation key path

## Order Data Format

Order data cũng có format tương tự. Xem `components/order/OrderTable.tsx` và `components/order/ExpandedOrderTabs.tsx` để reference.

---

**Cập nhật lần cuối**: November 2025


