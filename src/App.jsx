import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

const Admin = lazy(() => import('./pages/Admin'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/mgmt-a7f3k9"
          element={(
            <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
              <Admin />
            </Suspense>
          )}
        />
      </Routes>
    </BrowserRouter>
  )
}
