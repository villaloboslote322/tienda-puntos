import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './pages/Dashboard'
import AsignarPuntos from './components/AsignarPuntos'
import ReglasCRUD from './components/ReglasCRUD'
import PremiosCRUD from './components/PremiosCRUD'
import CanjesPendientes from './components/CanjesPendientes'
import Reportes from './components/Reportes'
import Administracion from './components/Administracion'

type Page = 'login' | 'dashboard' | 'asignar-puntos' | 'reglas' | 'premios' | 'canjes' | 'reportes' | 'administracion'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login')
  const [token, setToken] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem('admin_token')
    const savedUsuario = localStorage.getItem('admin_usuario')

    if (savedToken && savedUsuario) {
      setToken(savedToken)
      setUsuario(JSON.parse(savedUsuario))
      setCurrentPage('dashboard')
    }
    setLoading(false)
  }, [])

  const handleLogin = (newToken: string, newUsuario: any) => {
    setToken(newToken)
    setUsuario(newUsuario)
    localStorage.setItem('admin_token', newToken)
    localStorage.setItem('admin_usuario', JSON.stringify(newUsuario))
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setToken(null)
    setUsuario(null)
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_usuario')
    setCurrentPage('login')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Tienda Puntos - Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{usuario?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-3 text-sm font-medium ${
                currentPage === 'dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('asignar-puntos')}
              className={`px-4 py-3 text-sm font-medium ${
                currentPage === 'asignar-puntos'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Asignar Puntos
            </button>
            <button
              onClick={() => setCurrentPage('reglas')}
              className={`px-4 py-3 text-sm font-medium ${
                currentPage === 'reglas'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Reglas de Puntos
            </button>
            <button
              onClick={() => setCurrentPage('premios')}
              className={`px-4 py-3 text-sm font-medium ${
                currentPage === 'premios'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Premios
            </button>
            <button
              onClick={() => setCurrentPage('canjes')}
              className={`px-4 py-3 text-sm font-medium ${
                currentPage === 'canjes'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Canjes Pendientes
            </button>
            <button
              onClick={() => setCurrentPage('reportes')}
              className={`px-4 py-3 text-sm font-medium ${
                currentPage === 'reportes'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Reportes
            </button>
            <button
              onClick={() => setCurrentPage('administracion')}
              className={`px-4 py-3 text-sm font-medium ${
                currentPage === 'administracion'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Administración
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentPage === 'dashboard' && <Dashboard token={token} />}
        {currentPage === 'asignar-puntos' && <AsignarPuntos token={token} />}
        {currentPage === 'reglas' && <ReglasCRUD token={token} />}
        {currentPage === 'premios' && <PremiosCRUD token={token} />}
        {currentPage === 'canjes' && <CanjesPendientes token={token} />}
        {currentPage === 'reportes' && <Reportes token={token} />}
        {currentPage === 'administracion' && usuario && (
          <Administracion token={token} usuarioActual={{ usuarioId: usuario.usuarioId, email: usuario.email }} />
        )}
      </main>
    </div>
  )
}

export default App
