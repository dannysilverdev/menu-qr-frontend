import { Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Home from './pages/Home'
import Menu from './pages/Menu'
import ViewMenu from './pages/ViewMenu';

function App() {
  return (
    <Routes>
      {/* Ruta publica */}
      <Route path="/view-menu/:userId" element={<ViewMenu />} />
      {/* Redirige a Login por defecto */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/home" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
    </Routes>
  )
}

export default App