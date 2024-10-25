import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Menu from './pages/Menu'


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/" element={<Login />} />
      {/* Redirige a Login por defecto */}
    </Routes>
  )
}

export default App