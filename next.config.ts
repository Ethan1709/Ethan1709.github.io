import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Génère un site 100% statique dans ./out (servable par GitHub Pages)
  output: "export",
  // GitHub Pages sert mieux les URLs en /page/ → /page/index.html
  trailingSlash: true,
  // Pas d'optimiseur d'images serveur en export statique
  images: { unoptimized: true },
};

export default nextConfig;
