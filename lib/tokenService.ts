"use client";

import { AUTH_CONFIG } from "./authConfig";

/**
 * Clear all auth and shop-related caches on logout
 * This prevents data leakage between different shop accounts
 */
export function clearAuthStorage() {
  if (typeof window === "undefined") {
    return;
  }

  // Clear auth-specific storage
  localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER);
  localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.CACHED_AT);
  localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN_EXPIRES_AT);

  // Clear sale-related caches (prevents product data leakage)
  localStorage.removeItem("sale-tabs-data");
  localStorage.removeItem("sale-active-tab");

  // Clear pinned items caches
  localStorage.removeItem("order-pinned-items");
  localStorage.removeItem("pinnedReturns");
  localStorage.removeItem("stock-return-pinned-items");

  // Clear settings caches
  localStorage.removeItem("settings.eInvoiceEnabled");
  localStorage.removeItem("settings.products.importCostManagement");
  localStorage.removeItem("settings.products.placeImportOrder");
  localStorage.removeItem("settings.products.costMethod");
  localStorage.removeItem("settings.tax.vatTax");
  localStorage.removeItem("settings.customers.manageByBranch");
  localStorage.removeItem("settings.customers.manageByPersonInCharge");
  localStorage.removeItem("settings.customers.manageAsSupplier");
  localStorage.removeItem("settings.customers.debtWarning");
  localStorage.removeItem("settings.customers.mandatoryFields");
  localStorage.removeItem("settings.customers.loyaltyPoints");
  localStorage.removeItem("settings.customers.promotions");
  localStorage.removeItem("settings.customers.voucher");
  localStorage.removeItem("settings.customers.coupon");
  localStorage.removeItem("settings.customers.couponApplyWithOther");
  localStorage.removeItem("settings.products.attributesEnabled");
  localStorage.removeItem("settings.products.unitOfMeasureEnabled");

  // Clear bank list cache
  localStorage.removeItem("bankListCache");

  // Clear order settings
  const orderSettingKeys = [
    "order_setting_autoPrintInvoice",
    "order_setting_autoPrintKitchen",
    "order_setting_autoCompleteOrder",
    "order_setting_autoAddFee",
    "order_setting_autoAddDiscount",
  ];
  orderSettingKeys.forEach((key) => localStorage.removeItem(key));

  // Clear product group management caches
  localStorage.removeItem("settings.products.productGroupManagement.enabled");
  localStorage.removeItem("settings.products.productGroupManagement.groups");

  // Clear delivery data (keys stored as delivery_${orderId})
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith("delivery_") || key.includes("-pinned-items"))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));

  // Clear return tabs data
  localStorage.removeItem("return-tabs-data");

  // Clear order tabs data  
  localStorage.removeItem("order-tabs-data");

  // Clear inventory check pinned items
  localStorage.removeItem("inventory-check-pinned-items");

  // Clear invoice pinned items
  localStorage.removeItem("invoice-pinned-items");

  // Clear import orders pinned items
  localStorage.removeItem("import-orders-pinned-items");

  // Clear suppliers pinned items
  localStorage.removeItem("suppliers-pinned-items");

  // Clear stock-in pinned items
  localStorage.removeItem("stock-in-pinned-items");

  // Clear stock disposal pinned items
  localStorage.removeItem("stock-disposal-pinned-items");

  // Clear product sort preferences
  localStorage.removeItem("product-sort-preference");
}

export function updateTokenExpiration(tokenExpiresAt?: number) {
  if (typeof window === "undefined") {
    return;
  }

  if (tokenExpiresAt) {
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN_EXPIRES_AT, String(tokenExpiresAt));
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return false;
    }

    const data = await res.json().catch(() => null);

    if (data?.tokenExpiresAt) {
      updateTokenExpiration(data.tokenExpiresAt);
      return true;
    }

    return false;
  } catch (error) {
    console.error("[tokenService] Refresh access token failed:", error);
    return false;
  }
}

