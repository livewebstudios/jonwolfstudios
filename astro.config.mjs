// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jonwolfnj.com',
  output: 'static',
  trailingSlash: 'always',
  adapter: netlify(),
  integrations: [react(), sitemap()],
  build: {
    format: 'directory',
  },
});
