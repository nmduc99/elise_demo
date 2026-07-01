# Ledger Column Visibility Feature

## Overview

The Ledger page now includes a column visibility toggle feature that allows users to customize which columns are displayed in the table. This provides a more flexible and personalized viewing experience.

## Features

### 1. Column Visibility Toggle
- Users can show/hide any column in the ledger table
- Changes are persisted to `localStorage` for consistency across sessions
- A dropdown menu provides easy access to all available columns

### 2. Default Visible Columns
By default, the following columns are visible:
- Code (Mã phiếu)
- Time (Thời gian)
- Payer/Payee (Người nộp/nhận)
- Type (Loại thu chi)
- Amount In (Thu)
- Amount Out (Chi)
- Status (Trạng thái)

### 3. Available Columns
Users can toggle visibility for:
- Code
- Time
- Created At
- Created By
- Branch
- Type
- Bank Account Name
- Bank Account Number
- Payer Code
- Payer/Payee
- Payer Phone
- Payer Address
- Amount In
- Amount Out
- Transaction Content
- Notes
- Ledger Type
- Status

## Implementation Details

### State Management

```typescript
// Default visible columns
const defaultVisibleColumns = new Set([
  "code", "time", "payerOrPayee", "type", "amountIn", "amountOut", "status"
]);

const [visibleColumns, setVisibleColumns] = useState<Set<string>>(defaultVisibleColumns);
```

### LocalStorage Persistence

The visibility state is saved to `localStorage` under the key `ledger-visible-columns`:

```typescript
localStorage.setItem('ledger-visible-columns', JSON.stringify([...newSet]));
```

### Column Filtering

The `LedgerTable` component filters columns based on the visibility state:

```typescript
const columns = visibleColumns 
  ? allColumns.filter(col => visibleColumns.has(col.key as string))
  : allColumns;
```

## User Interface

### Desktop View
A "Customize Columns" button (with Settings icon) is located next to the "Export File" button in the top-right corner of the page.

### Dropdown Menu
- Clicking the button opens a dropdown menu
- Each column is listed with a checkbox
- Checked items are visible, unchecked items are hidden
- Changes take effect immediately

## Usage Example

```typescript
// In page.tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">
      <Settings2 size={18} className="mr-2" />
      {t("columnVisibility")}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuLabel>{t("selectColumns")}</DropdownMenuLabel>
    <DropdownMenuSeparator />
    {availableColumns.map((column) => (
      <DropdownMenuCheckboxItem
        key={column.key}
        checked={visibleColumns.has(column.key)}
        onCheckedChange={() => handleToggleColumn(column.key)}
      >
        {column.label}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

## Translation Keys

### Vietnamese (`vi.json`)
```json
{
  "ledger": {
    "columnVisibility": "Tùy chỉnh cột",
    "selectColumns": "Chọn cột hiển thị"
  }
}
```

### English (`en.json`)
```json
{
  "ledger": {
    "columnVisibility": "Customize Columns",
    "selectColumns": "Select columns to display"
  }
}
```

## Benefits

1. **Personalization**: Users can customize the table to show only relevant information
2. **Performance**: Fewer columns can improve rendering performance for large datasets
3. **User Experience**: Reduces clutter and makes it easier to focus on important data
4. **Persistence**: Settings are saved across sessions for convenience

## Future Enhancements

Possible improvements for this feature:
1. Add preset column configurations (e.g., "Basic View", "Detailed View", "Accounting View")
2. Allow column reordering via drag-and-drop
3. Export/import column configurations
4. Share column configurations between users
5. Add column width customization
6. Include search/filter in the column selector for tables with many columns


