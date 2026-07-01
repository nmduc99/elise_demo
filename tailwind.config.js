/**
 * ============================================
 * TAILWIND CSS CONFIGURATION
 * ============================================
 * 
 * File này map CSS Variables từ globals.css thành Tailwind classes.
 * 
 * ĐỂ THAY ĐỔI MÀU SẮC CHỦ ĐẠO CỦA PROJECT:
 * 
 * 1. KHÔNG cần thay đổi file này
 * 2. Chỉ cần thay đổi CSS Variables trong file app/globals.css
 * 3. Tất cả Tailwind classes (bg-custom, text-custom, etc.) sẽ tự động
 *    sử dụng giá trị mới từ CSS Variables
 * 
 * CÁCH SỬ DỤNG MÀU SẮC TRONG COMPONENTS:
 * 
 * - bg-custom              → Background màu cam chủ đạo
 * - text-custom            → Text màu cam chủ đạo
 * - border-custom          → Border màu cam chủ đạo
 * - bg-custom-secondary    → Background màu cam nhạt hơn
 * - bg-custom-hover        → Background màu cam khi hover
 * - text-dark              → Text màu đen xám (#111827)
 * - bg-foreground          → Background màu đen thuần (#000000)
 * 
 * Ví dụ:
 *   <div className="bg-custom text-white">...</div>
 *   <button className="text-custom hover:bg-custom/10">...</button>
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",

        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",

        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",

        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",

        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",

        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",

        destructive: "var(--destructive)",

        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        /* ===== MÀU SẮC CHỦ ĐẠO =====
         * Các màu này được map từ CSS Variables trong globals.css
         * KHÔNG cần thay đổi ở đây - chỉ cần thay đổi trong globals.css
         */
        custom: "var(--custom)", // Màu cam chủ đạo (#FF6B35)
        "custom-secondary": "var(--custom-secondary)", // Màu cam nhạt hơn (#FF8C42)
        "custom-hover": "var(--custom-hover)", // Màu cam khi hover (#ea580c)
        dark: "var(--dark)", // Màu đen xám (#111827)
        "dark-gradient-from": "var(--dark-gradient-from)",
        "dark-gradient-via": "var(--dark-gradient-via)",
        "dark-gradient-to": "var(--dark-gradient-to)",

        // Sidebar
        sidebar: "var(--sidebar)",
        "sidebar-foreground": "var(--sidebar-foreground)",
        "sidebar-primary": "var(--sidebar-primary)",
        "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
        "sidebar-accent": "var(--sidebar-accent)",
        "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
        "sidebar-border": "var(--sidebar-border)",
        "sidebar-ring": "var(--sidebar-ring)",

        // Charts
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        "chart-4": "var(--chart-4)",
        "chart-5": "var(--chart-5)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [],
};
