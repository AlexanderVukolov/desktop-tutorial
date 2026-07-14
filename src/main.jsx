import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Регистрация service worker — для установки задачника на телефон.
// Пропускаем в автономном демо (там нет сети и своего домена).
if ('serviceWorker' in navigator && !globalThis.NSL_LOCAL_DEMO && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
