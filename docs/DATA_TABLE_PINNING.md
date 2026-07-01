# Data Table Pinning Feature

Tài liệu này hướng dẫn cách sử dụng tính năng ghim/đánh dấu sao (pin/bookmark) trong DataTable component.

## Tính năng

- Thêm cột sao ở đầu mỗi row
- Click vào sao để ghim/bỏ ghim row
- Các row được ghim tự động được đưa lên đầu bảng
- Sao được tô màu vàng khi được ghim
- Hover effect và animation mượt mà

## Props mới

### DataTable Props

```typescript
interface DataTableProps<T> {
  // ... existing props
  
  // Pin/Star functionality
  enablePinning?: boolean;          // Bật/tắt tính năng pinning
  pinnedItems?: Set<string>;         // Set các item keys đã được pin
  onTogglePin?: (itemKey: string) => void;  // Callback khi toggle pin
}
```

## Cách sử dụng

### Bước 1: Thêm state để quản lý pinned items

```typescript
"use client";

import { useState, useEffect } from "react";

export default function YourTableComponent() {
  // State để lưu các items đã được pin
  const [pinnedItems, setPinnedItems] = useState<Set<string>>(new Set());

  // Load từ localStorage khi component mount
  useEffect(() => {
    const saved = localStorage.getItem('your-table-pinned-items');
    if (saved) {
      setPinnedItems(new Set(JSON.parse(saved)));
    }
  }, []);

  // Handler để toggle pin
  const handleTogglePin = (itemKey: string) => {
    setPinnedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      
      // Lưu vào localStorage
      localStorage.setItem('your-table-pinned-items', JSON.stringify([...newSet]));
      
      return newSet;
    });
  };

  // ... rest of component
}
```

### Bước 2: Sử dụng DataTable với pinning

```typescript
<DataTable
  items={yourItems}
  columns={columns}
  getRowKey={(item) => item.id}
  
  // Enable pinning
  enablePinning={true}
  pinnedItems={pinnedItems}
  onTogglePin={handleTogglePin}
  
  // ... other props
/>
```

## Ví dụ hoàn chỉnh

```typescript
"use client";

import { DataTable, ColumnConfig } from "@/components/ui/data-table";
import { useState, useEffect } from "react";

interface Transaction {
  id: string;
  code: string;
  date: string;
  branch: string;
  staff: string;
  type: string;
  customer: string;
  amount: number;
}

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pinnedItems, setPinnedItems] = useState<Set<string>>(new Set());

  // Load pinned items từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem('transaction-pinned-items');
    if (saved) {
      setPinnedItems(new Set(JSON.parse(saved)));
    }
  }, []);

  // Toggle pin handler
  const handleTogglePin = (itemKey: string) => {
    setPinnedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      
      // Persist to localStorage
      localStorage.setItem('transaction-pinned-items', JSON.stringify([...newSet]));
      
      return newSet;
    });
  };

  const columns: ColumnConfig<Transaction>[] = [
    {
      label: "Mã phiếu",
      key: "code",
    },
    {
      label: "Thời gian",
      key: "date",
    },
    {
      label: "Chi nhánh",
      key: "branch",
    },
    // ... more columns
  ];

  return (
    <DataTable
      items={transactions}
      columns={columns}
      getRowKey={(item) => item.id}
      
      // Enable pinning
      enablePinning={true}
      pinnedItems={pinnedItems}
      onTogglePin={handleTogglePin}
      
      // Other props
      sortConfig={{ key: "date", direction: "desc" }}
      onSort={(key) => {/* handle sort */}}
    />
  );
}
```

## Lưu trữ state

### Sử dụng localStorage

```typescript
// Save
localStorage.setItem('table-pinned-items', JSON.stringify([...pinnedItems]));

// Load
const saved = localStorage.getItem('table-pinned-items');
if (saved) {
  setPinnedItems(new Set(JSON.parse(saved)));
}
```

### Sử dụng API/Backend (tùy chọn)

```typescript
// Save to API
const handleTogglePin = async (itemKey: string) => {
  setPinnedItems((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(itemKey)) {
      newSet.delete(itemKey);
    } else {
      newSet.add(itemKey);
    }
    return newSet;
  });
  
  // Sync with backend
  await fetch('/api/user-preferences/pinned-items', {
    method: 'POST',
    body: JSON.stringify({ pinnedItems: [...pinnedItems] }),
  });
};

// Load from API
useEffect(() => {
  fetch('/api/user-preferences/pinned-items')
    .then(res => res.json())
    .then(data => setPinnedItems(new Set(data.pinnedItems)));
}, []);
```

## Styling

### Custom row styling dựa trên pinned state

```typescript
<DataTable
  items={items}
  columns={columns}
  enablePinning={true}
  pinnedItems={pinnedItems}
  onTogglePin={handleTogglePin}
  
  // Custom styling cho pinned rows
  bodyRowClassName={(item, isExpanded, isPinned) => {
    const baseClass = "hover:bg-gray-100 cursor-pointer";
    if (isPinned) {
      return `${baseClass} bg-yellow-50 border-l-4 border-l-yellow-400`;
    }
    return baseClass;
  }}
/>
```

## Tính năng nâng cao

### Reset tất cả pins

```typescript
const handleResetAllPins = () => {
  setPinnedItems(new Set());
  localStorage.removeItem('table-pinned-items');
};

<Button onClick={handleResetAllPins}>
  Reset All Pins
</Button>
```

### Export pinned items

```typescript
const exportPinnedItems = () => {
  const pinned = items.filter(item => pinnedItems.has(getRowKey(item)));
  // Export logic here (CSV, Excel, etc.)
};
```

### Giới hạn số lượng pins

```typescript
const handleTogglePin = (itemKey: string) => {
  setPinnedItems((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(itemKey)) {
      newSet.delete(itemKey);
    } else {
      // Giới hạn tối đa 10 items được pin
      if (newSet.size >= 10) {
        alert("Bạn chỉ có thể ghim tối đa 10 mục");
        return prev;
      }
      newSet.add(itemKey);
    }
    return newSet;
  });
};
```

## Lưu ý

1. **Performance**: Sử dụng `Set` để quản lý pinned items cho performance tốt hơn
2. **Persistence**: Lưu state vào localStorage hoặc backend để giữ lại sau khi reload
3. **Unique Keys**: Đảm bảo `getRowKey` trả về unique key cho mỗi item
4. **Click Event**: Click vào sao sẽ không trigger `onRowClick` của row (đã xử lý `stopPropagation`)

## Icon Sao

- **Không được ghim**: Sao màu xám nhạt (gray-300)
- **Hover**: Sao màu xám đậm hơn (gray-400)
- **Được ghim**: Sao được tô màu vàng (yellow-400) với fill

## Troubleshooting

### Pinned items không được sort lên đầu
- Đảm bảo `enablePinning={true}`
- Kiểm tra `pinnedItems` có đúng định dạng Set không
- Verify `getRowKey` trả về đúng key

### State không persist sau reload
- Kiểm tra localStorage có được set đúng không
- Verify JSON.stringify/parse hoạt động đúng
- Đảm bảo useEffect load state khi mount

---

**Cập nhật lần cuối**: November 2025


