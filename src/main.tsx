import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@unocss/reset/eric-meyer.css'
import 'virtual:uno.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
