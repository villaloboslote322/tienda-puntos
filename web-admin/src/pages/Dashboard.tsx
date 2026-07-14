import { useState, useEffect } from 'react'
import axios from 'axios'
import api from '../api'
import ClienteSearch from '../components/ClienteSearch'

interface DashboardProps {
  token: string
}

interface Stats {
  totalClientes: number
  puntosHoy: number
  canjesPendientes: number
}

export default function Dashboard({ token }: DashboardProps) {
  const [stats, setStats] = useState<Stats>({
    totalClientes: 0,
    puntosHoy: 0,
    canjesPendientes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', whatsapp: '', dni: '', email: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [token])

  const fetchStats = async () => {
    setLoading(false)
  }

  const handleCreateCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/api/clientes', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFormData({ nombre: '', whatsapp: '', dni: '', email: '' })
      setShowCreateForm(false)
      fetchStats()
    } catch (err: any) {
      alert('Error creating cliente: ' + (err.response?.data?.message || err.message))
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tienda de Puntos</h1>

      {/* Create Cliente Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Crear Cliente</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            {showCreateForm ? 'Cancelar' : '+ Nuevo Cliente'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateCliente} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="WhatsApp (+54...)"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="DNI"
                value={formData.dni}
                onChange={(e) => setFormData({...formData, dni: e.target.value})}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
            >
              {creating ? 'Creando...' : 'Crear Cliente'}
            </button>
          </form>
        )}
      </div>

    </div>
  )
}
