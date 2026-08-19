// @barbershop-os/domain — pure business rules shared by web and api.
//
// AUTHORITY RULE: sharing this code does NOT make client results
// authoritative. The frontend may call these functions for instant previews;
// the backend calls the same functions inside transactions and its results
// are the only ones that count. Money never moves based on a client-side
// calculation. (See docs/architecture/DEMO_TO_PRODUCTION_MIGRATION.md.)

export * from "./scheduling/types.js";
export * from "./scheduling/duration.js";
export * from "./scheduling/availability.js";
export * from "./queue/estimate-wait.js";
export * from "./pricing/checkout.js";
export * from "./money.js";
