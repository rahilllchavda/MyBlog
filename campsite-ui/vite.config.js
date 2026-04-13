import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendUrl =
  "https://campsite-api-aph2bsd4f4h8hjd4.canadacentral-01.azurewebsites.net";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
