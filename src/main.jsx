import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Landing from './components/Landing'
import UiKitDemo from './components/UiKitDemo'
import './tailwind.css'
import './styles.css'

// Tiny hash router: '#/app' shows the tool, '#/uikit' the toolkit demo, else landing.
function routeFor(hash) {
  if (hash.startsWith('#/app')) return 'app'
  if (hash.startsWith('#/uikit')) return 'uikit'
  return 'landing'
}

function Root() {
  const [route, setRoute] = React.useState(() => routeFor(window.location.hash))
  React.useEffect(() => {
    const onHash = () => setRoute(routeFor(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  if (route === 'app') return <App />
  if (route === 'uikit') return <UiKitDemo />
  return <Landing onEnter={() => { window.location.hash = '#/app' }} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
