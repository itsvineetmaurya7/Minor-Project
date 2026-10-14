// Vite build/dev-server configuration; the React plugin enables JSX transformation and refresh.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins: [react()] });
