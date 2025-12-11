import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import './App.css'

function App() {
  const location = useLocation()

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="TurboShop" className="logo-image" />
          </Link>
          <nav className="nav">
            <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>
              Catálogo
            </Link>
          </nav>
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/product/:sku" element={<ProductDetail />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 TurboShop - Marketplace de Autopartes</p>
        </div>
      </footer>
    </div>
  )
}

export default App

