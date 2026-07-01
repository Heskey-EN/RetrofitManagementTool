import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Landing from './components/Landing'
import AdminPage from './components/AdminPage'
import './tailwind.css'
import './styles.css'

// Tiny hash router: '#/admin' is the admin console, '#/app' the tool, anything
// else the landing page.
function routeFor(hash) {
  if (hash.startsWith('#/admin')) return 'admin'
  if (hash.startsWith('#/app')) return 'app'
  return 'landing'
}

function Root() {
  const [route, setRoute] = React.useState(() => routeFor(window.location.hash))
  React.useEffect(() => {
    const onHash = () => setRoute(routeFor(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  if (route === 'admin') return <AdminPage />
  if (route === 'app') return <App />
  return <Landing onEnter={() => { window.location.hash = '#/app' }} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
