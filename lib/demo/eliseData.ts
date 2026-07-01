/**
 * Self-contained mock data layer for the Elise fashion retail chain demo.
 *
 * This module powers the entire demo (dashboard, stores, warehouse, HR,
 * analytics, POS) WITHOUT any external backend. All data is generated
 * deterministically from a seed so server and client render identically and
 * the demo is reproducible.
 *
 * The implementation is split into focused modules under `./data` to keep each
 * file small and cohesive; this barrel re-exports everything so existing
 * imports from `@/lib/demo/eliseData` keep working unchanged.
 */

export * from "./data/rng";
export * from "./data/geo";
export * from "./data/stores";
export * from "./data/catalog";
export * from "./data/hr";
export * from "./data/performance";
