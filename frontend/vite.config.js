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
        target: "http://localhost:3000", // ✅ Backend tourne sur ce port
        changeOrigin: true,
        secure: false,
      },
    },
  },

  preview: {
    port: 5173,
    strictPort: true,
    host: "0.0.0.0",
  },
});
