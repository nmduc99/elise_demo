/**
 * Formatting helpers for the Elise chain demo.
 * Kept dependency-free so they can run on both server and client.
 */

export function formatVnd(value: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(Math.round(value || 0));
}

/**
 * Compact currency for KPI cards, e.g. 1.2 tỷ / 850 tr.
 */
export function formatVndShort(value: number): string {
    const v = Math.round(value || 0);
    const abs = Math.abs(v);
    if (abs >= 1_000_000_000) {
        return `${(v / 1_000_000_000).toFixed(1)} tỷ`;
    }
    if (abs >= 1_000_000) {
        return `${Math.round(v / 1_000_000)} tr`;
    }
    if (abs >= 1_000) {
        return `${Math.round(v / 1_000)}k`;
    }
    return String(v);
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat("vi-VN").format(Math.round(value || 0));
}

export function formatPercent(value: number, fractionDigits = 1): string {
    return `${(value || 0).toFixed(fractionDigits)}%`;
}

export function formatDate(value: string | Date): string {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}
