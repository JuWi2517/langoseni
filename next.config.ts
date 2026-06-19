import type { NextConfig } from "next";

// For GitHub Pages project sites the app is served from
// https://<user>.github.io/<repo>/, so assets need a base path of "/<repo>".
// The deploy workflow sets NEXT_PUBLIC_BASE_PATH; locally it's empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Produce a fully static site in `out/` that any static host can serve.
  output: "export",
  // GitHub Pages can't run the Next.js image optimizer.
  images: { unoptimized: true },
  // Emit /kitchen/index.html instead of /kitchen.html so sub-routes resolve.
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
