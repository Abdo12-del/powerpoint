import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  // مسار النشر: '/' محلياً، و'/<اسم-المستودع>/' على GitHub Pages (يضبطه سير العمل .github/workflows/deploy.yml عبر BASE_PATH)
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  optimizeDeps: {
    // harfbuzzjs يحمّل ملف wasm عبر new URL(..., import.meta.url) — يجب أن يبقى خارج التجميع المسبق ليُحلّ المسار صحيحاً
    exclude: ['harfbuzzjs'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // The live preview is served through a proxied host name.
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
