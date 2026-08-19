import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Monorepo: trace files from the workspace root so Vercel/standalone
  // builds include hoisted dependencies correctly.
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
