import { StrictMode } from 'react'
// @ts-ignore
import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)