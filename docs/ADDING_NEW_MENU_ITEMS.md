# Hướng dẫn thêm menu mới vào Header

Tài liệu này hướng dẫn cách thêm menu item mới vào navigation header của ứng dụng.

## Cấu trúc thư mục liên quan

```
bmg_inventory_management_fe/
├── app/[locale]/              # Các trang của ứng dụng
│   └── [menu-name]/
│       └── page.tsx           # Trang component
├── components/
│   ├── Header.tsx             # Header chính (desktop)
│   ├── MobileNav.tsx          # Navigation mobile
│   └── ui/
│       └── in-development-card.tsx  # Card "Đang phát triển"
├── i18n/
│   └── routing.ts             # Cấu hình route i18n
└── languages/
    ├── vi.json                # Translation tiếng Việt
    └── en.json                # Translation tiếng Anh
```

## Các bước thêm menu mới

### Bước 1: Tạo trang placeholder

Tạo file `app/[locale]/[menu-slug]/page.tsx`:

```typescript
"use client";

import InDevelopmentCard from "@/components/ui/in-development-card";
import { useTranslations } from "next-intl";

export default function YourNewPage() {
  const t = useTranslations("common");

  return (
    <div className="container mx-auto">
      <InDevelopmentCard
        title={t("inDevelopment.title")}
        description={t("inDevelopment.description")}
      />
    </div>
  );
}
```

### Bước 2: Thêm translation keys

Cập nhật `languages/vi.json` và `languages/en.json`:

```json
// vi.json
{
  "common": {
    "yourMenuKey": "Tên Menu Tiếng Việt"
  }
}

// en.json
{
  "common": {
    "yourMenuKey": "Menu Name in English"
  }
}
```

### Bước 3: Thêm route vào i18n routing

Cập nhật `i18n/routing.ts`:

```typescript
export const routing = defineRouting({
  // ... existing config
  pathnames: {
    // ... existing routes
    "/your-menu-slug": {
      en: "/your-menu-slug",
      vi: "/your-vietnamese-slug",
    }
  }
});
```

### Bước 4: Thêm menu item vào Header (Desktop)

Cập nhật `components/Header.tsx`:

```typescript
<NavigationMenuItem>
  <NavigationMenuLink asChild>
    <Link
      href="/your-menu-slug"
      className={clsx(
        "text-sm font-semibold px-3 py-2.5 rounded-md transition-colors",
        "hover:bg-[#005AC3]",
        pathname.startsWith("/your-menu-slug") && "bg-[#005AC3] text-white"
      )}
    >
      {t("yourMenuKey")}
    </Link>
  </NavigationMenuLink>
</NavigationMenuItem>
```

### Bước 5: Thêm menu item vào MobileNav

Cập nhật `components/MobileNav.tsx`:

```typescript
<Link
  href="/your-menu-slug"
  onClick={() => setOpen(false)}
  className={clsx(
    "block px-3 py-2 rounded-md text-sm font-semibold",
    pathname.startsWith("/your-menu-slug")
      ? "bg-[#0070F4] text-white"
      : "hover:bg-gray-100"
  )}
>
  {t("yourMenuKey")}
</Link>
```

## Menu với Submenu (Dropdown)

Nếu menu có submenu, sử dụng `Popover` component:

### 1. Tạo state và handlers:

```typescript
const [yourMenuOpen, setYourMenuOpen] = useState(false);
const [yourMenuTimeoutId, setYourMenuTimeoutId] = useState<NodeJS.Timeout | null>(null);

const handleYourMenuMouseEnter = () => {
  if (yourMenuTimeoutId) clearTimeout(yourMenuTimeoutId);
  setYourMenuOpen(true);
};

const handleYourMenuMouseLeave = () => {
  const id = setTimeout(() => setYourMenuOpen(false), 100);
  setYourMenuTimeoutId(id);
};
```

### 2. Thêm links array:

```typescript
const yourMenuLinks = [
  { href: "/submenu-1", label: t("submenu1") },
  { href: "/submenu-2", label: t("submenu2") },
];
```

### 3. Render Popover menu:

```typescript
<Popover open={yourMenuOpen} onOpenChange={setYourMenuOpen}>
  <div
    onMouseEnter={handleYourMenuMouseEnter}
    onMouseLeave={handleYourMenuMouseLeave}
    className="inline-block border-none"
    suppressHydrationWarning
  >
    <PopoverTrigger asChild>
      <div className={clsx(
        "text-sm font-semibold px-3 py-2.5 rounded-md transition-colors cursor-pointer",
        "hover:bg-[#005AC3]",
        isYourMenuActive && "bg-[#005AC3] text-white"
      )}>
        {t("yourMenuKey")}
      </div>
    </PopoverTrigger>
    <PopoverContent
      onMouseEnter={handleYourMenuMouseEnter}
      onMouseLeave={handleYourMenuMouseLeave}
      className="w-48 p-2"
    >
      <ul className="flex flex-col gap-1">
        {yourMenuLinks.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded",
                pathname.startsWith(link.href)
                  ? "bg-[#0070F4] text-white"
                  : "hover:bg-gray-100"
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </PopoverContent>
  </div>
</Popover>
```

### 4. Cho MobileNav, sử dụng Accordion:

```typescript
<Accordion type="single" collapsible className="border-none">
  <AccordionItem value="your-menu" className="border-none">
    <AccordionTrigger className="px-3 text-sm font-semibold hover:no-underline">
      {t("yourMenuKey")}
    </AccordionTrigger>
    <AccordionContent className="pl-5 flex flex-col gap-1">
      {yourMenuLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href as any}
          onClick={() => setOpen(false)}
          className={clsx(
            "block px-3 py-2 rounded text-sm",
            pathname.startsWith(link.href)
              ? "bg-[#0070F4] text-white"
              : "hover:bg-gray-100"
          )}
        >
          {link.label}
        </Link>
      ))}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

## Lưu ý

1. **Route slugs**: Sử dụng kebab-case cho route slugs (ví dụ: `online-sales`, `tax-accounting`)
2. **Translation keys**: Sử dụng camelCase cho keys (ví dụ: `onlineSales`, `taxAccounting`)
3. **Thứ tự menu**: Thêm menu mới vào vị trí phù hợp trong navigation list
4. **Responsive**: Luôn thêm menu vào cả Header (desktop) và MobileNav (mobile)
5. **i18n**: Đảm bảo thêm translation cho cả tiếng Việt và tiếng Anh
6. **InDevelopmentCard**: Sử dụng `InDevelopmentCard` component có sẵn cho tính năng chưa phát triển

## Ví dụ thực tế

Xem các menu items đã được implement:
- **Simple menu**: `/staff`, `/reports`, `/online-sales`, `/tax-accounting`
- **Dropdown menu**: `/products` (Hàng hoá), `/order` (Đơn hàng), `/partners` (Đối tác)

## Component InDevelopmentCard

Component này đã được tạo sẵn tại `components/ui/in-development-card.tsx` để hiển thị thông báo "Tính năng đang phát triển" ở giữa trang cho các trang placeholder.

### Props:
- `title`: string (optional) - Tiêu đề card, mặc định: "Tính năng đang phát triển"
- `description`: string (optional) - Mô tả chi tiết, mặc định: "Tính năng này đang được phát triển và sẽ sớm ra mắt trong thời gian tới."

### Usage:
```typescript
import InDevelopmentCard from "@/components/ui/in-development-card";
import { useTranslations } from "next-intl";

const t = useTranslations("common");

<InDevelopmentCard
  title={t("inDevelopment.title")}
  description={t("inDevelopment.description")}
/>
```

## Checklist khi thêm menu mới

- [ ] Tạo page component trong `app/[locale]/[slug]/page.tsx`
- [ ] Thêm translation keys vào `languages/vi.json`
- [ ] Thêm translation keys vào `languages/en.json`
- [ ] Thêm route vào `i18n/routing.ts`
- [ ] Thêm menu item vào `components/Header.tsx`
- [ ] Thêm menu item vào `components/MobileNav.tsx`
- [ ] Test trên cả desktop và mobile
- [ ] Test với cả tiếng Việt và tiếng Anh
- [ ] Kiểm tra active state khi navigate
- [ ] Đảm bảo không có linter errors

---

**Cập nhật lần cuối**: November 2025


