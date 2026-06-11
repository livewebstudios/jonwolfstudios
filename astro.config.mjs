// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jonwolfnj.com',
  output: 'static',
  // honor PORT when a tool (e.g. preview) assigns one; default 4321
  server: { port: process.env.PORT ? Number(process.env.PORT) : 4321 },
  trailingSlash: 'always',
  integrations: [react(), sitemap()],
  build: {
    format: 'directory',
  },
});
