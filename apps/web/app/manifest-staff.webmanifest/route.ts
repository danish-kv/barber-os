// Serves the staff app manifest at /manifest-staff.webmanifest.
// Next's special app/manifest.ts only supports one manifest per app, so the
// staff-specific one is a plain static route handler (same pattern as
// app/feed.xml-style routes). Baked at build time — env branding included.

import { staffManifest } from "@/lib/pwa-manifest";

export const dynamic = "force-static";

export function GET() {
  return Response.json(staffManifest(), {
    headers: { "content-type": "application/manifest+json" },
  });
}
