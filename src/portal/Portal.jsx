import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import PortalLogin from './PortalLogin'
import Dashboard from './Dashboard'
import Articles from './Articles'
import ArticleEditor from './ArticleEditor'
import PreviewArticle from './PreviewArticle'
import { apiFetch } from './portalStore'
import '../styles/portal.css'

export default function Portal() {
  const [auth, setAuth] = useState({ ready: false, authenticated: false, email: '' })
  const [toast, setToast] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let active = true
    apiFetch('/api/session')
      .then(data => { if (active) setAuth({ ready: true, authenticated: Boolean(data.authenticated), email: data.email || '' }) })
      .catch(() => { if (active) setAuth({ ready: true, authenticated: false, email: '' }) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(timer)
  }, [toast])

  function notify(message) {
    setToast(message)
  }

  function login(data) {
    setAuth({ ready: true, authenticated: true, email: data.email || '' })
    navigate('/portal/dashboard', { replace: true })
  }

  async function logout() {
    try { await apiFetch('/api/logout', { method: 'POST', body: '{}' }) } catch { /* session can still be cleared locally */ }
    setAuth({ ready: true, authenticated: false, email: '' })
    navigate('/portal', { replace: true })
  }

  if (!auth.ready) {
    return <div className="portal-splash"><img src="/images/logo.png" alt="RNS Shipping" width="52" height="52" /><span>Opening Insights Studio…</span></div>
  }

  if (!auth.authenticated) {
    return (
      <>
        <Seo title="Insights Studio" description="Private editorial portal for RNS Shipping." path="/portal" noindex />
        <PortalLogin onSuccess={login} />
      </>
    )
  }

  if (location.pathname === '/portal' || location.pathname === '/portal/') {
    return <Navigate to="/portal/dashboard" replace />
  }

  return (
    <>
      <Seo title="Insights Studio" description="Private editorial portal for RNS Shipping." path="/portal" noindex />
      <Routes>
        <Route path="dashboard" element={<Dashboard email={auth.email} onLogout={logout} notify={notify} />} />
        <Route path="articles" element={<Articles email={auth.email} onLogout={logout} notify={notify} />} />
        <Route path="articles/new" element={<ArticleEditor email={auth.email} onLogout={logout} notify={notify} />} />
        <Route path="articles/:slug/edit" element={<ArticleEditor email={auth.email} onLogout={logout} notify={notify} />} />
        <Route path="articles/:slug/preview" element={<PreviewArticle email={auth.email} onLogout={logout} />} />
        <Route path="*" element={<Navigate to="/portal/dashboard" replace />} />
      </Routes>
      {toast ? <div className="portal-toast" role="status">{toast}</div> : null}
    </>
  )
}
