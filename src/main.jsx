import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Landing from './components/Landing'
import './tailwind.css'
import './styles.css'

// Tiny hash router: '#/app' shows the tool, anything else shows the landing page.
function Root() {
  const [route, setRoute] = React.useState(() => (window.location.hash.startsWith('#/app') ? 'app' : 'landing'))
  React.useEffect(() => {
    const onHash = () => setRoute(window.location.hash.startsWith('#/app') ? 'app' : 'landing')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route === 'app' ? <App /> : <Landing onEnter={() => { window.location.hash = '#/app' }} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
