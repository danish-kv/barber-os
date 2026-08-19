import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Royal Cuts — Barbershop OS",
    short_name: "Royal Cuts",
    description:
      "The operating system for modern barbershops. Bookings, queue, staff, payments and analytics.",
    start_url: "/demo",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#8c4a1d",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
