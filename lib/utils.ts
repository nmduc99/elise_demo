import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function slugify(str: string): string {
  if (!str) return "";

  // Convert to lowercase
  str = str.toLowerCase();

  // Remove accents
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Replace d with d (in some cases normalize doesn't handle ð/đ well for all locales, but for Vietnamese: đ -> d)
  str = str.replace(/[đĐ]/g, "d");

  // Remove special characters, spaces with nothing (since user wants "Quỳnh Anh Store" -> "quynhanhstore")
  // The user prompt said: "dạng chữ thường không dấu" and "nhập Quỳnh Anh Store thì phải map về quynhanhstore"
  // It implies removing spaces as well.
  str = str.replace(/[^a-z0-9]/g, "");

  return str;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils/formatDate.ts
export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date);
}

export const exportToCSV = (items: any[]) => {
  if (!items || items.length === 0) return;

  const headers = Object.keys(items[0]).join(",");
  const rows = items.map((item) => Object.values(item).join(",")).join("\n");
  const csv = "\ufeff" + [headers, rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "product.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};

export function formatNumber(value: number | string): string {
  if (value === null || value === undefined || value === "") return "";
  const number = Number(value);
  if (isNaN(number)) return "";
  return number.toLocaleString("vi-VN");
}

export function parseNumber(value: string): number {
  if (!value) return 0;
  return Number(value.replace(/[.,]/g, ""));
}

export function sanitizeInput(value: string): string {
  // Chỉ cho phép nhập số, dấu . hoặc ,
  return value.replace(/[^0-9.,]/g, "");
}

export function isOverLimit(value: string, limit: number = 13): boolean {
  const digitsOnly = value.replace(/[^0-9]/g, "");
  return digitsOnly.length > limit;
}

/**
 * Get a valid image URL from an array of image URLs
 * @param imageUrls - Array of image URLs
 * @param fallbackImage - Fallback image URL (default: "/images/noImage.png")
 * @returns Valid image URL or fallback image
 */
export function getValidImageUrl(
  imageUrls?: string[],
  fallbackImage: string = "/images/noImage.png"
): string {
  if (!imageUrls || imageUrls.length === 0) return fallbackImage;

  const validUrls = imageUrls.filter(
    (url) =>
      typeof url === "string" &&
      (url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("/"))
  );

  return validUrls[0] || fallbackImage;
}

/**
 * Format invoice code with revision number
 * Only shows revision number if it's greater than 0
 * @param invoiceCode - The base invoice code
 * @param revisionNo - The revision number
 * @returns Formatted invoice code (e.g., "HD-123" or "HD-123.1" if revisionNo > 0)
 */
export function formatInvoiceCode(invoiceCode: string, revisionNo?: number | null): string {
  if (typeof revisionNo === "number" && revisionNo > 0) {
    return `${invoiceCode}.${revisionNo}`;
  }
  return invoiceCode;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

export function toAddressPartString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "name" in value && typeof (value as { name: unknown }).name === "string") {
    return (value as { name: string }).name;
  }
  return "";
}