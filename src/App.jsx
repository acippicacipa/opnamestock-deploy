import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import StockOpnamePage from './components/StockOpnamePage'
import ProductsPage from './components/ProductsPage'
import SessionsPage from './components/SessionsPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stock-opname/:sessionId" element={<StockOpnamePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
      </Routes>
    </Router>
  )
}

export default App