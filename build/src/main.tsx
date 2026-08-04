import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { scheduleDailyKioskReload } from './kioskReload.ts'

// If this tab stays open for days (e.g. running on a TV), reload once a
// day at 4am local time to pick up new deploys and reset any long-run
// WebGL/memory drift. Harmless no-op impact for normal browsing sessions.
scheduleDailyKioskReload(4, 0)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
