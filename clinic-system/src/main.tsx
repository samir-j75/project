import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { ClinicProvider } from './context/ClinicContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ClinicProvider>
        <App />
      </ClinicProvider>
    </ErrorBoundary>
  </StrictMode>,
)