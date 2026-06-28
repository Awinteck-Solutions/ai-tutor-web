import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Required for @react-oauth/google popup sign-in (postMessage back to opener). */
const googleOAuthHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 7071,
    headers: googleOAuthHeaders,
  },
  preview: {
    port: 7071,
    headers: googleOAuthHeaders,
  },
})
