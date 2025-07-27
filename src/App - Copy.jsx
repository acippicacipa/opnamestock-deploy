import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import StockOpnamePage from './components/StockOpnamePage'
import SessionsPage from './components/SessionsPage'
import ProductsPage from './components/ProductsPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stock-opname/:sessionId" element={<StockOpnamePage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

