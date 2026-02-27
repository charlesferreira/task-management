import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/board" element={<Navigate to="/projects" replace />} />
        <Route path="/list" element={<Navigate to="/tasks" replace />} />
        <Route path="/zen" element={<Navigate to="/tracker" replace />} />
        <Route path="/:view" element={<App />} />
        <Route path="/:view/task/:taskId" element={<App />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
