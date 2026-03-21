import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    // mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      filename: "sw-20250321.js",
      manifestFilename: "manifest-20250321.webmanifest",
      includeAssets: [
        "favicon-20250321.ico",
        "favicon-20250321.svg",
        "pwa-192x192-20250321.png",
        "pwa-512x512-20250321.png",
      ],
      workbox: {
        cacheId: "shadematch-20250321",
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      manifest: {
        name: "ShadeMatch – AI Outfit Color Matcher",
        short_name: "ShadeMatch",
        description: "Upload clothing images and get AI-powered color combination suggestions",
        theme_color: "#6C3CE0",
        background_color: "#0F1117",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192-20250321.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512-20250321.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512-20250321.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
