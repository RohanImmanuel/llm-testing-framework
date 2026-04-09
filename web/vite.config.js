import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, ".", "");
    var backendUrl = env.VITE_API_BASE_URL || "http://localhost:3001";
    return {
        plugins: [react()],
        server: {
            port: 5173,
            proxy: {
                "/api": backendUrl,
                "/health": backendUrl,
            },
        },
    };
});
