export const languages = [
    {
        code: "vi",
        label: "Tiếng Việt",
        shortLabel: "VN",
        flag: "/icons/vietnam.png",
    },
    {
        code: "en",
        label: "English",
        shortLabel: "EN",
        flag: "/icons/united-kingdom.png",
    },
];

// Helper function to normalize pathname to a valid route pattern
export const normalizePathname = (pathname: string): string => {
    if (!pathname) return "/dashboard";

    // List of base routes that should be preserved as-is
    const baseRoutes = [
        "/dashboard",
        "/products",
        "/price-setup",
        "/stock-in",
        "/stock-return",
        "/import-orders",
        "/inventory-check",
        "/stock-disposal",
        "/warehouse",
        "/sale",
        "/invoice",
        "/order",
        "/return",
        "/category",
        "/auth",
        "/about-us",
        "/export",
        "/transactions",
        "/customers",
        "/suppliers",
        "/rooms",
        "/ledger",
        "/settings",
        "/staff",
        "/reports",
        "/online-sales",
        "/tax-accounting",
        "/account",
    ];

    // Check if pathname is already a base route
    if (baseRoutes.includes(pathname)) {
        return pathname;
    }

    // Normalize dynamic routes to their base routes
    // e.g., /stock-in/123 -> /stock-in, /stock-in/clone/123 -> /stock-in
    const dynamicRoutePatterns = [
        { pattern: /^\/stock-in\/clone\/[^/]+$/, base: "/stock-in" },
        { pattern: /^\/stock-in\/[^/]+$/, base: "/stock-in" },
        { pattern: /^\/stock-return\/clone\/[^/]+$/, base: "/stock-return" },
        { pattern: /^\/stock-return\/[^/]+$/, base: "/stock-return" },
        { pattern: /^\/import-orders\/[^/]+$/, base: "/import-orders" },
        { pattern: /^\/inventory-check\/clone\/[^/]+$/, base: "/inventory-check" },
        { pattern: /^\/inventory-check\/[^/]+$/, base: "/inventory-check" },
        { pattern: /^\/stock-disposal\/clone\/[^/]+$/, base: "/stock-disposal" },
        { pattern: /^\/stock-disposal\/[^/]+$/, base: "/stock-disposal" },
        { pattern: /^\/invoice\/[^/]+$/, base: "/invoice" },
        { pattern: /^\/order\/[^/]+$/, base: "/order" },
        { pattern: /^\/return\/[^/]+$/, base: "/return" },
        { pattern: /^\/customers\/[^/]+$/, base: "/customers" },
        { pattern: /^\/suppliers\/[^/]+$/, base: "/suppliers" },
        { pattern: /^\/settings\/[^/]+$/, base: "/settings" },
        { pattern: /^\/staff\/[^/]+$/, base: "/staff" },
    ];

    for (const { pattern, base } of dynamicRoutePatterns) {
        if (pattern.test(pathname)) {
            return base;
        }
    }

    // Extract base route by taking the first segment
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
        const baseRoute = `/${segments[0]}`;
        if (baseRoutes.includes(baseRoute)) {
            return baseRoute;
        }
    }

    // Fallback to dashboard
    return "/dashboard";
};
