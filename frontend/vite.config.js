import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/jalsetuAI/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
