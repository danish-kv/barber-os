// Selection totals. Catalog data is injected as maps — the demo binds its
// seeded SERVICES/ADDONS, the API will bind tenant catalog rows.
//
// NOTE ON UNITS: `price` here is a plain number in whatever unit the caller
// uses. Demo V1 passes rupees (display convention). Production contracts use
// integer paise — see ../money.ts. Do not mix units within one caller.

export interface CatalogEntry {
  price: number;
  durationMin: number;
}

export type CatalogLookup = ReadonlyMap<string, CatalogEntry>;

export function totalDurationMin(
  serviceIds: string[],
  addonIds: string[],
  services: CatalogLookup,
  addons: CatalogLookup
): number {
  const svc = serviceIds.reduce(
    (t, id) => t + (services.get(id)?.durationMin ?? 0),
    0
  );
  const add = addonIds.reduce(
    (t, id) => t + (addons.get(id)?.durationMin ?? 0),
    0
  );
  return svc + add;
}

export function totalPrice(
  serviceIds: string[],
  addonIds: string[],
  services: CatalogLookup,
  addons: CatalogLookup
): number {
  const svc = serviceIds.reduce(
    (t, id) => t + (services.get(id)?.price ?? 0),
    0
  );
  const add = addonIds.reduce((t, id) => t + (addons.get(id)?.price ?? 0), 0);
  return svc + add;
}
