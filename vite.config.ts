import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves project sites (not user/org pages, not a custom
  // domain) from a subpath: https://<user>.github.io/<repo>/ rather than
  // the domain root. Without this, every absolute-rooted asset reference
  // (favicon, textures, JS/CSS bundles) 404s once deployed, even though
  // everything works fine in local dev at "/". Update this if the repo is
  // ever renamed, or remove it entirely if you switch to a custom domain
  // or a <user>.github.io user/org page.
  base: '/loworbit/',
  worker: {
    format: 'es'
  }
})
