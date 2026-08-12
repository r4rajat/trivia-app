import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

const redirectedRoute = sessionStorage.getItem('independence-trivia:redirect')
if (redirectedRoute) {
  sessionStorage.removeItem('independence-trivia:redirect')
  window.history.replaceState(null, '', redirectedRoute)
}

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>)
