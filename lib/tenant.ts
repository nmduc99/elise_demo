// lib/tenant.ts
export function parseTenantFromHost(host: string): string {
    if (!host) return "www";
    // strip port if any
    const hostname = host.split(":")[0].toLowerCase();

    // localdev handling:
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.includes("127.0.0.1")) {
        // if you want to test subdomains locally using abc.localtest.me, that hostname will be parsed below
        return "local";
    }

    const parts = hostname.split(".");
    // e.g. abc.example.com => ['abc','example','com']
    if (parts.length >= 3) {
        return parts[0];
    }

    // fallback
    return "www";
}

/**
 * Get current tenant from window.location.host (client-side only)
 * Returns full hostname for API header
 * Falls back to "www" if not available
 */
export function getCurrentTenant(): string {
    if (typeof window === "undefined") return "www";
    // Return full hostname for API header 
    return window.location.host;
}
