import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Pitch from './Pitch'
import { LanguageProvider } from './i18n'
import './index.css'

const isLiveApp = window.location.pathname === '/app' || window.location.pathname.startsWith('/app/')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      {isLiveApp ? <App /> : <Pitch />}
    </LanguageProvider>
  </React.StrictMode>,
)
