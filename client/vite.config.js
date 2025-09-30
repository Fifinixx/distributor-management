import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // This will expose the server to the local network
    // You can also specify a specific IP address like '0.0.0.0'
    // host: '0.0.0.0', 
    port: 5173, // Or your desired port
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})