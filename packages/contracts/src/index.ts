// @barbershop-os/contracts — shared API contract foundation (Phase 0A).
// Endpoint DTO catalogs are added phase by phase; only primitives live here
// so far. Server validates with these schemas; the web client is generated
// from them — drift becomes a compile error.

export * from "./primitives.js";
export * from "./errors.js";
export * from "./pagination.js";
export * from "./health.js";
