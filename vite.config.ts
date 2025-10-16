// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: true,
    host: "0.0.0.0", // Izinkan akses dari external hosts
    port: 5173, // Gunakan port default Vite agar sesuai dengan ngrok
    strictPort: true, // Fail jika port tidak available
    // Pastikan service worker bisa diakses
    fs: {
      allow: [".."],
    },
  },
  // Pastikan service worker files di-copy ke dist
  publicDir: "public",
  build: {
    // Pastikan service worker tidak di-minify
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
});
