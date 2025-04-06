import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "index.html",
    },
  },

  server: {
    port: 5173, // ✅ Frontend tourne sur ce port
    strictPort: true, // ✅ Bloque si 5173 est déjà pris
    host: "0.0.0.0", // ✅ Nécessaire pour Docker
    proxy: {
      "/api": {
        target: "http://fastify_backend:3000", // ✅ Nom du service dans docker-compose
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "ws://fastify_backend:3000",
        ws: true,
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 5173,
    strictPort: true,
    host: "0.0.0.0",
  },
});
