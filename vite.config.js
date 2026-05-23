import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const base = process.env.VITE_BASE || "/";

export default defineConfig({
  base,
  plugins: [tailwindcss(), react()],
});
