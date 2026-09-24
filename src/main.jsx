import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import './styles/refinement.css'

const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

const root = document.getElementById('root')
if (root.hasChildNodes() && root.dataset.route?.replace(/\/$/, '') === window.location.pathname.replace(/\/$/, '')) ReactDOM.hydrateRoot(root, app)
else ReactDOM.createRoot(root).render(app)
