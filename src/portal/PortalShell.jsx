import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Icon } from '../components/Icons'

const links = [
  { to: '/portal/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/portal/articles', label: 'Articles', icon: 'edit' },
  { to: '/portal/articles/new', label: 'New article', icon: 'plus' },
]

export default function PortalShell({ email, onLogout, title, eyebrow, actions, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="portal-shell">
      <aside className={`portal-sidebar ${open ? 'is-open' : ''}`}>
        <div className="portal-sidebar__brand">
          <a href="/" className="portal-brand portal-brand--dark">
            <img src="/images/logo.png" alt="RNS Shipping LLC logo" width="42" height="42" />
            <span>RNS Shipping<small>Insights Studio</small></span>
          </a>
          <button type="button" className="portal-sidebar__close" onClick={() => setOpen(false)} aria-label="Close menu"><Icon name="close" size={20} /></button>
        </div>

        <nav className="portal-sidebar__nav" aria-label="Portal navigation">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'is-active' : ''} end={link.to === '/portal/articles'}>
              <Icon name={link.icon} size={19} /> {link.label}
            </NavLink>
          ))}
          <span className="portal-sidebar__label">Site</span>
          <a href="/insights" target="_blank" rel="noopener noreferrer"><Icon name="eye" size={19} /> View insights</a>
          <a href="/" target="_blank" rel="noopener noreferrer"><Icon name="globe" size={19} /> View website</a>
        </nav>

        <div className="portal-sidebar__user">
          <span className="portal-avatar">{email?.slice(0, 2).toUpperCase() || 'RN'}</span>
          <span><b>{email?.split('@')[0] || 'Editor'}</b><small>{email || 'rns-shipping.com'}</small></span>
          <button type="button" onClick={onLogout} aria-label="Sign out" title="Sign out"><Icon name="logout" size={19} /></button>
        </div>
      </aside>

      {open ? <button type="button" className="portal-scrim" onClick={() => setOpen(false)} aria-label="Close menu" /> : null}

      <div className="portal-main">
        <header className="portal-topbar">
          <button type="button" className="portal-menu" onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" size={22} /></button>
          <div>
            {eyebrow ? <span>{eyebrow}</span> : null}
            <h1>{title}</h1>
          </div>
          <div className="portal-topbar__actions">{actions}</div>
        </header>
        <div className="portal-content">{children}</div>
      </div>
    </div>
  )
}
